package com.montrixfortune.repository;

import com.montrixfortune.entity.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @EntityGraph(attributePaths = {"user", "order"})
    List<Payment> findAllByOrderByPaymentDateDesc();

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
}