package com.montrixfortune.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project title is required")
    @Size(max = 255, message = "Project title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Project description is required")
    @Size(max = 5000, message = "Project description must be at most 5000 characters")
    private String description;

    @NotEmpty(message = "At least one project image is required")
    @Size(max = 8, message = "A project can have at most 8 images")
    private List<String> images;

    @NotNull(message = "Display order is required")
    private Integer displayOrder = 0;

    @NotNull(message = "Active state is required")
    private Boolean active = true;
}
