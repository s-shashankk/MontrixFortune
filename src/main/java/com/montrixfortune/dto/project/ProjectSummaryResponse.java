package com.montrixfortune.dto.project;

/** Lightweight project for lists: only the cover image travels over the wire. */
public record ProjectSummaryResponse(
        Long id,
        String title,
        String description,
        String coverImage,
        int imageCount,
        Integer displayOrder,
        Boolean active) {
}
