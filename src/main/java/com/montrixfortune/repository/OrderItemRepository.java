package com.montrixfortune.repository;

import com.montrixfortune.entity.OrderItem;
import com.montrixfortune.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
	boolean existsByProduct(Product product);
}