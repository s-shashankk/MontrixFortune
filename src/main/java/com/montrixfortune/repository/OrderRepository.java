package com.montrixfortune.repository;

import com.montrixfortune.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"user", "shippingAddress", "items", "items.product"})
    Page<Order> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "shippingAddress", "items", "items.product"})
    Optional<Order> findDetailedById(Long id);

    List<Order> findByUserId(Long userId);

    List<Order> findByOrderStatusAndPaymentMethodAndOrderDateBefore(
            com.montrixfortune.enums.OrderStatus orderStatus,
            com.montrixfortune.enums.PaymentMethod paymentMethod,
            java.time.LocalDateTime before);
    Page<Order> findByUserId(Long userId, Pageable pageable);
}