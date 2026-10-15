package com.montrixfortune.exception;

public class PaymentNotFoundException extends ResourceNotFoundException{
    public PaymentNotFoundException(String message) {
        super(message);
    }
}
