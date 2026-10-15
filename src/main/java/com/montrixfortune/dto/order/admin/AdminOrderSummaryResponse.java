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
public class AdminOrderSummaryResponse {

    private Long id;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private String paymentFailureReason;

    private List<ItemPreview> items;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String fullName;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private PaymentCollectionStatus paymentCollectionStatus;
    private PaymentStatus gatewayPaymentStatus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPreview {
        private Long id;
        private String name;
        private String imageUrl;
        private Integer quantity;
    }
}
