package com.montrixfortune.controller;

import com.montrixfortune.entity.HeroSlide;
import com.montrixfortune.service.HeroSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hero-slides")
@CrossOrigin
@RequiredArgsConstructor
public class HeroSlideController {

    private final HeroSlideService heroSlideService;

    @GetMapping
    public List<HeroSlide> getActiveSlides() {
        return heroSlideService.getActiveSlides();
    }
}
