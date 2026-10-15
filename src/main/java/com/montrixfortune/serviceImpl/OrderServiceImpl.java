package com.montrixfortune.serviceImpl;
import com.montrixfortune.dto.order.CreateOrderRequest;
import com.montrixfortune.entity.*;
import com.montrixfortune.enums.OrderStatus;
import com.montrixfortune.enums.PaymentCollectionStatus;
import com.montrixfortune.enums.PaymentMethod;
import com.montrixfortune.exception.*;
import com.montrixfortune.repository.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.montrixfortune.service.OrderService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

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
    public Order createOrder(CreateOrderRequest request) {

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Address not found");
        }

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if(cartItems.isEmpty()){
            throw new EmptyCartException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(address);
        order.setOrderDate(LocalDateTime.now());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentCollectionStatus(request.getPaymentMethod() == PaymentMethod.COD
            ? PaymentCollectionStatus.COD
            : PaymentCollectionStatus.COD);
        order.setPaymentFailureReason(null);
        order.setOrderStatus(request.getPaymentMethod() == PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // Lock products in a fixed order (by id) so concurrent checkouts cannot deadlock or oversell.
        cartItems = new ArrayList<>(cartItems);
        cartItems.sort(java.util.Comparator.comparing(ci -> ci.getProduct().getId()));

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (cartItem.getPrice() == null || cartItem.getPrice().compareTo(product.getPrice()) != 0) {
                cartItem.setPrice(product.getPrice());
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new CartValidationException("Product '" + product.getName() + "' does not have enough stock");
            }

            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());

            BigDecimal itemTotal = cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(itemTotal);

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        if (request.getPaymentMethod() == PaymentMethod.COD) {
            cartItemRepository.deleteAll(cartItems);
        }

        return savedOrder;
    }

    @Override
    public Page<Order> getUserOrders(int page, int size) {

        User user = getCurrentUser();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("orderDate"), Sort.Order.desc("id"))
        );

        return orderRepository.findByUserId(user.getId(), pageable); // Usually by user id
    }

    @Override
    public Order getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        User current = getCurrentUser();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getId().equals(current.getId())) {
            throw new OrderNotFoundException("Order not found");
        }
        return order;
    }

    @Override
    public Order confirmOnlineOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
            return order;
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new PaymentProcessingException("Order is no longer payable");
        }

        if (order.getOrderStatus() == OrderStatus.ORDER_FAILED) {
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new PaymentProcessingException("Stock is no longer available for one or more products");
                }

                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);
        order.setPaymentCollectionStatus(PaymentCollectionStatus.PAID);
        order.setPaymentFailureReason(null);
        Order savedOrder = orderRepository.save(order);

        Cart userCart = getOrCreateCart(order.getUser());
        for (OrderItem orderItem : order.getItems()) {
            cartItemRepository.findByCartAndProduct(userCart, orderItem.getProduct())
                    .ifPresent(cartItemRepository::delete);
        }

        return savedOrder;
    }

    @Override
    public Order markOrderPaymentFailed(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.ORDER_FAILED) {
            return order;
        }

        if (order.getOrderStatus() == OrderStatus.CONFIRMED) {
            throw new PaymentProcessingException("Confirmed order cannot be marked as failed");
        }

        order.setOrderStatus(OrderStatus.ORDER_FAILED);
        order.setPaymentFailureReason(reason);

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        return orderRepository.save(order);
    }
}