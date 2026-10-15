package com.montrixfortune.exception;

public class AddressNotFoundException extends ResourceNotFoundException {

    public AddressNotFoundException(String message) {
        super(message);
    }
}