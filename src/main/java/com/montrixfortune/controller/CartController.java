package com.montrixfortune.controller;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.cart.AddToCartRequest;
import com.montrixfortune.entity.CartItem;
import com.montrixfortune.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ApiResponse<CartItem> addToCart(@Valid @RequestBody AddToCartRequest request){
        CartItem item = cartService.addToCart(request.getProductId(), request.getQuantity());
        return new ApiResponse<>(true, "Item added to cart", 200, java.time.LocalDateTime.now(), item);
    }

    @GetMapping
    public ApiResponse<List<CartItem>> getCart(){
        List<CartItem> items = cartService.getUserCart();
        return new ApiResponse<>(true, "Cart fetched", 200, java.time.LocalDateTime.now(), items);
    }

    @PutMapping("/update/{cartItemId}")
    public ApiResponse<CartItem> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity){
        CartItem item = cartService.updateQuantity(cartItemId, quantity);
        return new ApiResponse<>(true, "Cart item updated", 200, java.time.LocalDateTime.now(), item);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ApiResponse<Void> removeFromCart(@PathVariable Long cartItemId){
        cartService.removeFromCart(cartItemId);
        return new ApiResponse<>(true, "Item removed from cart", 200, java.time.LocalDateTime.now(), null);
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart(){
        cartService.clearCart();
        return new ApiResponse<>(true, "Cart cleared", 200, java.time.LocalDateTime.now(), null);
    }
}