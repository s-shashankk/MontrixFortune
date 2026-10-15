package com.montrixfortune.dto.payment;

import lombok.Data;

@Data
public class PaymentFailureRequest {

    private Long orderId;

    private String razorpayOrderId;

    private String reason;
}