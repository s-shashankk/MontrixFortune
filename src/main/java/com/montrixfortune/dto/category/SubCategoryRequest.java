package com.montrixfortune.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubCategoryRequest {

    @NotBlank(message = "Sub-category name is required")
    @Size(max = 120, message = "Sub-category name is too long")
    private String name;

    /** Required when creating. Ignored when renaming. */
    private Long categoryId;
}
