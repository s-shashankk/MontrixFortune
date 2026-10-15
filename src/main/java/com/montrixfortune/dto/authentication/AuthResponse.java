package com.montrixfortune.dto.authentication;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String message;
    private String token;
    private String role;
    private Long id;
    private String name;
    private String email;
    private String refreshToken;
}
