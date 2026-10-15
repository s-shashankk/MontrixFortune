package com.montrixfortune.dto.payment;

import lombok.Data;

@Data
public class PaymentVerificationRequest {

    private Long orderId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;
}