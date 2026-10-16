package com.montrixfortune.dto.project;

import java.util.List;

/** Full project, including every gallery image. */
public record ProjectResponse(
        Long id,
        String title,
        String description,
        List<String> images,
        Integer displayOrder,
        Boolean active) {
}
