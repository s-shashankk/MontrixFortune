package com.montrixfortune.serviceImpl;

import com.montrixfortune.dto.payment.AdminPaymentResponse;
import com.montrixfortune.dto.payment.CreatePaymentOrderRequest;
import com.montrixfortune.dto.payment.PaymentFailureRequest;
import com.montrixfortune.dto.payment.PaymentVerificationRequest;
import com.montrixfortune.entity.Order;
import com.montrixfortune.entity.Payment;
import com.montrixfortune.enums.PaymentMethod;
import com.montrixfortune.exception.PaymentProcessingException;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.OrderRepository;
import com.montrixfortune.repository.PaymentRepository;
import com.montrixfortune.repository.UserRepository;
import com.montrixfortune.service.OrderService;
import com.montrixfortune.service.PaymentService;
import com.razorpay.*;
import com.montrixfortune.enums.OrderStatus;
import com.montrixfortune.enums.PaymentStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final RazorpayClient razorpayClient;

    private final PaymentRepository paymentRepository;

    private final OrderRepository orderRepository;

    private final OrderService orderService;

    private final UserRepository userRepository;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    @Value("${razorpay.webhook.secret:}")
    private String razorpayWebhookSecret;

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof String ? (String) principal : null;
    }

    private void ensureOrderOwnership(Order order) {
        String email = getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new PaymentProcessingException("Unable to resolve current user");
        }

        Long currentUserId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        if (!order.getUser().getId().equals(currentUserId)) {
            throw new PaymentProcessingException("You are not allowed to process this payment");
        }
    }

    private String computeHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new PaymentProcessingException("Unable to validate payment signature", ex);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return java.security.MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private void validateCheckoutSignature(PaymentVerificationRequest request) {
        if (request.getRazorpayOrderId() == null || request.getRazorpayOrderId().isBlank()
                || request.getRazorpayPaymentId() == null || request.getRazorpayPaymentId().isBlank()
                || request.getRazorpaySignature() == null || request.getRazorpaySignature().isBlank()) {
            throw new PaymentProcessingException("Invalid payment verification payload");
        }

        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        String expectedSignature = computeHmacSha256(payload, razorpaySecret);

        if (!constantTimeEquals(expectedSignature, request.getRazorpaySignature())) {
            log.warn("Payment signature mismatch for razorpay order {}", request.getRazorpayOrderId());
            throw new PaymentProcessingException("Payment signature mismatch");
        }
    }

    private void markPaymentSuccess(Payment payment, String razorpayPaymentId, String signature) {
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            // Already recorded; make sure the order is confirmed too (no-op if it is).
            orderService.confirmOnlineOrder(payment.getOrder().getId());
            return;
        }

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(signature);
        payment.setFailureReason(null);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        try {
            orderService.confirmOnlineOrder(payment.getOrder().getId());
        } catch (RuntimeException ex) {
            log.error("PAID BUT ORDER NOT CONFIRMED: order {} razorpayPayment {} - check stock/status and refund if needed: {}",
                    payment.getOrder().getId(), razorpayPaymentId, ex.getMessage());
            throw ex;
        }
        log.info("Payment {} confirmed for order {}", razorpayPaymentId, payment.getOrder().getId());
    }

    private void markPaymentFailedInternal(Payment payment, Long orderId, String reason) {
        if (payment == null) {
            if (orderId == null) {
                throw new ResourceNotFoundException("Payment not found");
            }

            orderService.markOrderPaymentFailed(orderId, reason);
            return;
        }

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return;
        }

        payment.setPaymentStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        orderService.markOrderPaymentFailed(payment.getOrder().getId(), reason);
    }

    @Override
    public String createPaymentOrder(CreatePaymentOrderRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        ensureOrderOwnership(order);

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            throw new PaymentProcessingException("COD orders do not require online payment");
        }

        if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
            throw new PaymentProcessingException("Order is already paid");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new PaymentProcessingException("Cancelled order cannot be paid");
        }

        long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        // If a payment attempt for this order is still open at Razorpay, reuse it. Creating a second Razorpay
        // order (page reload, double click) would orphan the first one, and a payment made on it could not be matched.
        Payment existing = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (existing != null && existing.getPaymentStatus() == PaymentStatus.PENDING
                && existing.getRazorpayOrderId() != null) {
            try {
                com.razorpay.Order open = razorpayClient.orders.fetch(existing.getRazorpayOrderId());
                JSONObject openJson = new JSONObject(open.toString());
                if ("created".equals(openJson.optString("status")) && openJson.optLong("amount") == amountInPaise) {
                    return open.toString();
                }
            } catch (RazorpayException ex) {
                log.warn("Could not re-use Razorpay order {}: {}", existing.getRazorpayOrderId(), ex.getMessage());
            }
        }

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "order_" + order.getId());

        com.razorpay.Order razorpayOrder;

        try {
            razorpayOrder = razorpayClient.orders.create(options);
        } catch (RazorpayException e) {
            throw new PaymentProcessingException("Error creating Razorpay order", e);
        }

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(Payment::new);

        payment.setOrder(order);
        payment.setUser(order.getUser());
        payment.setAmount(order.getTotalAmount());
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setRazorpayPaymentId(null);
        payment.setRazorpaySignature(null);
        payment.setFailureReason(null);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        return razorpayOrder.toString();
    }

    @Override
    public String verifyPayment(PaymentVerificationRequest request) {

        validateCheckoutSignature(request);

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        ensureOrderOwnership(payment.getOrder());

        markPaymentSuccess(payment, request.getRazorpayPaymentId(), request.getRazorpaySignature());

        return "Payment Successful";
    }

    @Override
    public String markPaymentFailed(PaymentFailureRequest request) {
        Payment payment = null;

        if (request.getRazorpayOrderId() != null && !request.getRazorpayOrderId().isBlank()) {
            payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId()).orElse(null);
        }

        if (payment == null && request.getOrderId() != null) {
            payment = paymentRepository.findByOrderId(request.getOrderId()).orElse(null);
        }

        if (payment != null) {
            ensureOrderOwnership(payment.getOrder());
        } else if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            ensureOrderOwnership(order);
        }

        markPaymentFailedInternal(payment, request.getOrderId(), request.getReason());

        return "Payment failed";
    }

    @Override
    public String processWebhook(String payload, String signature) {
        if (razorpayWebhookSecret == null || razorpayWebhookSecret.isBlank()) {
            throw new PaymentProcessingException("Razorpay webhook secret is not configured");
        }

        if (signature == null || signature.isBlank()) {
            throw new PaymentProcessingException("Missing webhook signature");
        }

        String expectedSignature = computeHmacSha256(payload, razorpayWebhookSecret);
        if (!constantTimeEquals(expectedSignature, signature)) {
            log.warn("Rejected webhook with invalid signature");
            throw new PaymentProcessingException("Invalid webhook signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event", "");

        JSONObject payloadObject = event.optJSONObject("payload");
        JSONObject paymentWrapper = payloadObject != null ? payloadObject.optJSONObject("payment") : null;
        JSONObject paymentEntity = paymentWrapper != null ? paymentWrapper.optJSONObject("entity") : null;

        if (paymentEntity == null) {
            return "Ignored webhook";
        }

        String razorpayOrderId = paymentEntity.optString("order_id", null);
        String razorpayPaymentId = paymentEntity.optString("id", null);

        Payment payment = null;
        if (razorpayOrderId != null && !razorpayOrderId.isBlank()) {
            payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
        }

        if ("payment.captured".equals(eventType)) {
            if (payment == null) {
                return "Ignored webhook";
            }

            markPaymentSuccess(payment, razorpayPaymentId, signature);
            return "Webhook processed";
        }

        if ("payment.failed".equals(eventType)) {
            String reason = paymentEntity.optString("error_description", "Payment failed at gateway");
            markPaymentFailedInternal(payment, payment != null ? payment.getOrder().getId() : null, reason);
            return "Webhook processed";
        }

        return "Ignored webhook";
    }

    @Override
    public List<AdminPaymentResponse> getAllAdminPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc().stream()
                .map(payment -> {
                    String customerName = payment.getUser() != null ? payment.getUser().getName() : null;
                    String customerEmail = payment.getUser() != null ? payment.getUser().getEmail() : null;
                    String customerPhone = payment.getUser() != null ? payment.getUser().getPhone() : null;

                    if ((customerName == null || customerName.isBlank())
                            && payment.getOrder() != null
                            && payment.getOrder().getShippingAddress() != null) {
                        customerName = payment.getOrder().getShippingAddress().getFullName();
                    }

                    if ((customerPhone == null || customerPhone.isBlank())
                            && payment.getOrder() != null
                            && payment.getOrder().getShippingAddress() != null) {
                        customerPhone = payment.getOrder().getShippingAddress().getPhoneNumber();
                    }

                    if ((customerName == null || customerName.isBlank())
                            && customerEmail != null
                            && customerEmail.contains("@")) {
                        customerName = customerEmail.substring(0, customerEmail.indexOf('@'));
                    }

                    return new AdminPaymentResponse(
                            payment.getId(),
                            payment.getOrder() != null ? payment.getOrder().getId() : null,
                            payment.getRazorpayOrderId(),
                            payment.getRazorpayPaymentId(),
                            payment.getAmount(),
                            payment.getPaymentDate(),
                            payment.getPaymentStatus(),
                            payment.getFailureReason(),
                            payment.getOrder() != null ? payment.getOrder().getPaymentMethod() : null,
                            customerName,
                            customerEmail,
                            customerPhone
                    );
                })
                .toList();
    }
}