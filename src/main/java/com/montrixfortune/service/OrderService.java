package com.montrixfortune.service;

import com.montrixfortune.dto.order.CreateOrderRequest;
import com.montrixfortune.entity.Order;
import org.springframework.data.domain.Page;

public interface OrderService {

    Order createOrder(CreateOrderRequest request);
    Order getOrderById(Long orderId);
    Page<Order> getUserOrders(int page, int size);
    Order confirmOnlineOrder(Long orderId);
    Order markOrderPaymentFailed(Long orderId, String reason);


}