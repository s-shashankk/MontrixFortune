package com.montrixfortune.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentOrderRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

}
