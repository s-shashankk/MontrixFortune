package com.montrixfortune.service;

import com.montrixfortune.dto.payment.AdminPaymentResponse;
import com.montrixfortune.dto.payment.CreatePaymentOrderRequest;
import com.montrixfortune.dto.payment.PaymentFailureRequest;
import com.montrixfortune.dto.payment.PaymentVerificationRequest;

import java.util.List;

public interface PaymentService {

    String createPaymentOrder(CreatePaymentOrderRequest request);

    String verifyPayment(PaymentVerificationRequest request);

    String markPaymentFailed(PaymentFailureRequest request);

    String processWebhook(String payload, String signature);

    List<AdminPaymentResponse> getAllAdminPayments();

}