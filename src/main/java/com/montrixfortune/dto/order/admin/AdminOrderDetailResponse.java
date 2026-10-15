package com.montrixfortune.dto.order.admin;

import com.montrixfortune.enums.OrderStatus;
import com.montrixfortune.enums.PaymentCollectionStatus;
import com.montrixfortune.enums.PaymentMethod;
import com.montrixfortune.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDetailResponse {

    private Long id;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private PaymentCollectionStatus paymentCollectionStatus;
    private String paymentFailureReason;

    private Customer customer;
    private ShippingAddress shippingAddress;
    private List<Item> items;
    private PaymentInfo payment;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddress {
        private Long id;
        private String fullName;
        private String streetAddress;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phoneNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private Long id;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private ProductInfo product;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String imageUrl;
        private String categoryName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private Long id;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private PaymentStatus paymentStatus;
        private BigDecimal amount;
        private String failureReason;
        private LocalDateTime paymentDate;
    }
}
