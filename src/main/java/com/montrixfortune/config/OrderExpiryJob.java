package com.montrixfortune.config;

import com.montrixfortune.entity.Order;
import com.montrixfortune.enums.OrderStatus;
import com.montrixfortune.enums.PaymentMethod;
import com.montrixfortune.repository.OrderRepository;
import com.montrixfortune.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Online orders are created as PENDING and their stock is reserved immediately.
 * If the customer never pays, this job marks the order ORDER_FAILED and gives the stock back.
 * If the payment arrives late, the Razorpay webhook can still confirm the order (stock permitting).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpiryJob {

    private static final long EXPIRY_MINUTES = 30;

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(fixedDelay = 5 * 60 * 1000L, initialDelay = 60 * 1000L)
    public void releaseUnpaidOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(EXPIRY_MINUTES);
        List<Order> stale = orderRepository.findByOrderStatusAndPaymentMethodAndOrderDateBefore(
                OrderStatus.PENDING, PaymentMethod.RAZORPAY, cutoff);

        for (Order order : stale) {
            try {
                orderService.markOrderPaymentFailed(order.getId(), "Payment not completed in time");
                log.info("Released stock for unpaid order {}", order.getId());
            } catch (Exception ex) {
                log.warn("Could not expire order {}: {}", order.getId(), ex.getMessage());
            }
        }
    }
}
