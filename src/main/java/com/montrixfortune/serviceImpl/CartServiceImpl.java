package com.montrixfortune.serviceImpl;

import com.montrixfortune.entity.*;
import com.montrixfortune.exception.*;
import com.montrixfortune.repository.*;
import com.montrixfortune.service.CartService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    private User getCurrentUser(){

        String email = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    @Override
    public CartItem addToCart(Long productId, Integer quantity) {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        int newQuantity = quantity;

        if(cartItem != null){
            newQuantity = cartItem.getQuantity() + quantity;
        }

        if(product.getStockQuantity() < newQuantity){
            throw new CartValidationException("Requested quantity exceeds available stock");
        }

        if(cartItem != null){
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setPrice(product.getPrice());
        }

        return cartItemRepository.save(cartItem);
    }

    @Override
    public List<CartItem> getUserCart() {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        boolean priceChanged = false;

        for (CartItem item : cartItems) {

            Product product = item.getProduct();

            if (!item.getPrice().equals(product.getPrice())) {

                item.setPrice(product.getPrice());

                cartItemRepository.save(item);

                priceChanged = true;
            }
        }

        if(priceChanged){
            System.out.println("⚠ Some cart prices were updated.");
        }

        return cartItems;
    }

    @Override
    public CartItem updateQuantity(Long cartItemId, Integer quantity) {

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(getOrCreateCart(getCurrentUser()).getId())) {
            throw new CartItemNotFoundException("Cart item not found");
        }

        Product product = cartItem.getProduct();

        if(quantity > product.getStockQuantity()){
            throw new CartValidationException("Quantity exceeds available stock");
        }
        if(quantity <= 0){
            throw new CartValidationException("Quantity must be greater than zero");
        }

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public void removeFromCart(Long cartItemId) {

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        Cart cart = getOrCreateCart(getCurrentUser());
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new CartItemNotFoundException("Cart item not found");
        }

        // Cart.items is cascade=ALL + orphanRemoval and eagerly loaded: if the item stays in that
        // collection, Hibernate re-saves it on flush and the delete is silently undone.
        if (cart.getItems() != null) {
            cart.getItems().removeIf(item -> cartItemId.equals(item.getId()));
        }
        cartItemRepository.delete(cartItem);
        cartItemRepository.flush();
    }

    @Override
    public void clearCart() {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        List<CartItem> items = cartItemRepository.findByCart(cart);

        // Detach from the parent collection first, otherwise cascade re-saves the deleted rows.
        if (cart.getItems() != null) {
            cart.getItems().clear();
        }
        cartItemRepository.deleteAll(items);
        cartItemRepository.flush();
    }
}