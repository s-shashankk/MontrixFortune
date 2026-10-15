package com.montrixfortune.serviceImpl;
import com.montrixfortune.dto.authentication.AuthResponse;
import com.montrixfortune.dto.authentication.LoginRequest;
import com.montrixfortune.dto.authentication.RegisterRequest;
import com.montrixfortune.dto.authentication.UserResponse;
import com.montrixfortune.enums.UserRole;
import com.montrixfortune.entity.User;
import com.montrixfortune.exception.EmailAlreadyExistsException;
import com.montrixfortune.exception.InvalidCredentialsException;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.UserRepository;
import com.montrixfortune.security.JwtUtil;
import com.montrixfortune.security.RefreshTokenUtil;
import com.montrixfortune.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtutil;
    private final RefreshTokenUtil refreshTokenUtil;

    @Override
    public UserResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(UserRole.USER);

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new InvalidCredentialsException("This account has been disabled. Please contact support.");
        }

        String token = jwtutil.generateToken(user.getEmail());
        String refresh = refreshTokenUtil.generateRefreshToken(user.getEmail());

        return new AuthResponse(
                "Login successful",
                token,
                user.getRole().name(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                refresh
        );
    }

    @Override
    public UserResponse getProfile() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String token = refreshToken;
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!refreshTokenUtil.validateToken(token)) {
            throw new InvalidCredentialsException("Invalid refresh token");
        }

        String email = refreshTokenUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new InvalidCredentialsException("This account has been disabled");
        }

        String newToken = jwtutil.generateToken(user.getEmail());

        return new AuthResponse(
                "Token refreshed",
                newToken,
                user.getRole().name(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                token
        );
    }
}