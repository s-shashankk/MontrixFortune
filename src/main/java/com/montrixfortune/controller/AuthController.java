package com.montrixfortune.controller;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.authentication.AuthResponse;
import com.montrixfortune.dto.authentication.LoginRequest;
import com.montrixfortune.dto.authentication.RegisterRequest;
import com.montrixfortune.dto.authentication.UserResponse;
import com.montrixfortune.service.AuthService;

import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return new ApiResponse<>(true, "Registration successful", 201, java.time.LocalDateTime.now(), user);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return new ApiResponse<>(true, "Login successful", 200, java.time.LocalDateTime.now(), auth);
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> profile() {
        UserResponse user = authService.getProfile();
        return new ApiResponse<>(true, "Profile fetched", 200, java.time.LocalDateTime.now(), user);
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@RequestHeader("Authorization") String refreshToken) {
        AuthResponse auth = authService.refreshToken(refreshToken);
        return new ApiResponse<>(true, "Token refreshed", 200, java.time.LocalDateTime.now(), auth);
    }
}