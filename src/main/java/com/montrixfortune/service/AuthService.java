package com.montrixfortune.service;

import com.montrixfortune.dto.authentication.AuthResponse;
import com.montrixfortune.dto.authentication.LoginRequest;
import com.montrixfortune.dto.authentication.RegisterRequest;
import com.montrixfortune.dto.authentication.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getProfile();

    AuthResponse refreshToken(String refreshToken);

}