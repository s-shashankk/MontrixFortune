package com.montrixfortune.dto.hero;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HeroSlideRequest {

    @NotBlank(message = "Slide label is required")
    private String label;

    @NotBlank(message = "Slide title is required")
    private String title;

    @NotBlank(message = "Slide subtitle is required")
    private String subtitle;

    @NotBlank(message = "Slide image is required")
    private String imageUrl;

    private String textPosition = "LEFT";

    @NotNull(message = "Display order is required")
    private Integer displayOrder = 0;

    @NotNull(message = "Active state is required")
    private Boolean active = true;
}
