package com.montrixfortune.repository;

import com.montrixfortune.entity.HeroSlide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroSlideRepository extends JpaRepository<HeroSlide, Long> {
    List<HeroSlide> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    List<HeroSlide> findAllByOrderByDisplayOrderAscIdAsc();
}
