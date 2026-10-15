package com.montrixfortune.service;

import com.montrixfortune.entity.CartItem;

import java.util.List;

public interface CartService {

    CartItem addToCart(Long productId, Integer quantity);

    List<CartItem> getUserCart();

    CartItem updateQuantity(Long cartItemId, Integer quantity);

    void removeFromCart(Long cartItemId);

    void clearCart();
}