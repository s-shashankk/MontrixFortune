package com.montrixfortune.controller.admin;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.hero.HeroSlideRequest;
import com.montrixfortune.entity.HeroSlide;
import com.montrixfortune.service.HeroSlideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/hero-slides")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminHeroSlideController {

    private final HeroSlideService heroSlideService;

    @GetMapping
    public ApiResponse<List<HeroSlide>> getHeroSlides() {
        return new ApiResponse<>(true, "Hero slides fetched", 200, LocalDateTime.now(), heroSlideService.getAllSlides());
    }

    @PostMapping
    public ApiResponse<HeroSlide> createHeroSlide(@Valid @RequestBody HeroSlideRequest request) {
        HeroSlide slide = heroSlideService.createSlide(request);
        return new ApiResponse<>(true, "Hero slide created", 201, LocalDateTime.now(), slide);
    }

    @PutMapping("/{id}")
    public ApiResponse<HeroSlide> updateHeroSlide(@PathVariable Long id, @Valid @RequestBody HeroSlideRequest request) {
        HeroSlide slide = heroSlideService.updateSlide(id, request);
        return new ApiResponse<>(true, "Hero slide updated", 200, LocalDateTime.now(), slide);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteHeroSlide(@PathVariable Long id) {
        heroSlideService.deleteSlide(id);
        return new ApiResponse<>(true, "Hero slide deleted", 200, LocalDateTime.now(), null);
    }

    @PutMapping("/reorder")
    public ApiResponse<Void> reorderHeroSlides(@RequestBody List<Long> slideIds) {
        heroSlideService.reorderSlides(slideIds);
        return new ApiResponse<>(true, "Hero slides reordered", 200, LocalDateTime.now(), null);
    }
}
