package com.montrixfortune.repository;

import com.montrixfortune.entity.Cart;
import com.montrixfortune.entity.CartItem;
import com.montrixfortune.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    List<CartItem> findByCart(Cart cart);
    long deleteByProduct(Product product);
}