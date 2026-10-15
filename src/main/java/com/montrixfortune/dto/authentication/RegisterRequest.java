package com.montrixfortune.dto.authentication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    @jakarta.validation.constraints.Size(max = 100)
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @jakarta.validation.constraints.Size(min = 8, max = 72, message = "Password must be 8-72 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Password must contain a letter and a digit")
    private String password;

    @NotBlank
    private String phone;
}
