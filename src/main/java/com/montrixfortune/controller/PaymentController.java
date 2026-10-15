package com.montrixfortune.controller;

import com.montrixfortune.dto.payment.AdminPaymentResponse;
import com.montrixfortune.dto.payment.CreatePaymentOrderRequest;
import com.montrixfortune.dto.payment.PaymentFailureRequest;
import com.montrixfortune.dto.payment.PaymentVerificationRequest;
import com.montrixfortune.entity.Payment;
import com.montrixfortune.service.PaymentService;
import com.montrixfortune.repository.*;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @PostMapping("/create-order")
    public String createPaymentOrder(@Valid @RequestBody CreatePaymentOrderRequest request){

        return paymentService.createPaymentOrder(request);
    }

    @PostMapping("/verify")
    public String verifyPayment(@Valid @RequestBody PaymentVerificationRequest request){

        return paymentService.verifyPayment(request);
    }

    @PostMapping("/fail")
    public String markPaymentFailed(@RequestBody PaymentFailureRequest request) {
        return paymentService.markPaymentFailed(request);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> processWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        return ResponseEntity.ok(paymentService.processWebhook(payload, signature));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public List<AdminPaymentResponse> getAllPayments(){
        return paymentService.getAllAdminPayments();
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getUserPayments(@PathVariable Long userId){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            Long currentUserId = userRepository.findByEmail((String) auth.getPrincipal())
                    .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"))
                    .getId();
            if (!currentUserId.equals(userId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return paymentRepository.findByUserId(userId);
    }
}