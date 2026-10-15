package com.montrixfortune.controller;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.order.CreateOrderRequest;
import com.montrixfortune.entity.Order;
import com.montrixfortune.service.OrderService;

import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<Order> createOrder(@Valid @RequestBody CreateOrderRequest request){
        Order order = orderService.createOrder(request);
        return new ApiResponse<>(true, "Order created", 201, LocalDateTime.now(), order);
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrder(@PathVariable Long id){
        Order order = orderService.getOrderById(id);
        return new ApiResponse<>(true, "Order fetched", 200, LocalDateTime.now(), order);
    }

    @GetMapping
    public ApiResponse<Page<Order>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Order> orders = orderService.getUserOrders(page, size);
        return new ApiResponse<>(true, "Orders fetched", 200, LocalDateTime.now(), orders);
    }
}