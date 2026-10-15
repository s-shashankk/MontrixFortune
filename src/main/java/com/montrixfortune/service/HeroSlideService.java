package com.montrixfortune.service;

import com.montrixfortune.dto.hero.HeroSlideRequest;
import com.montrixfortune.entity.HeroSlide;

import java.util.List;

public interface HeroSlideService {

    List<HeroSlide> getActiveSlides();

    List<HeroSlide> getAllSlides();

    HeroSlide createSlide(HeroSlideRequest request);

    HeroSlide updateSlide(Long id, HeroSlideRequest request);

    void deleteSlide(Long id);

    void reorderSlides(List<Long> slideIds);
}
