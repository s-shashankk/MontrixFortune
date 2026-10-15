package com.montrixfortune.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private int status;
    private LocalDateTime timestamp;
    private T data;
}