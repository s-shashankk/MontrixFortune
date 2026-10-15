package com.montrixfortune.dto.payment;

import com.montrixfortune.enums.PaymentMethod;
import com.montrixfortune.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentResponse {
    private Long id;
    private Long orderId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentStatus paymentStatus;
    private String failureReason;
    private PaymentMethod paymentMethod;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
