package com.montrixfortune.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @jakarta.validation.constraints.Size(max = 255, message = "Name is too long")
    private String name;
    
    @jakarta.validation.constraints.Size(max = 1000, message = "Description can be at most 1000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Price must be greater than zero")
    @jakarta.validation.constraints.DecimalMax(value = "99999999.99", message = "Price is too large")
    private BigDecimal price;
    
    @NotNull(message = "Stock quantity is required")
    @jakarta.validation.constraints.Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity;
    
    private String imageUrl;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
}