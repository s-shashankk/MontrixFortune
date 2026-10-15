package com.montrixfortune.serviceImpl;

import com.montrixfortune.dto.hero.HeroSlideRequest;
import com.montrixfortune.entity.HeroSlide;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.HeroSlideRepository;
import com.montrixfortune.service.HeroSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HeroSlideServiceImpl implements HeroSlideService {

    private static final List<String> ALLOWED_TEXT_POSITIONS = List.of("LEFT", "CENTER", "RIGHT");

    private final HeroSlideRepository heroSlideRepository;

    @Override
    public List<HeroSlide> getActiveSlides() {
        return heroSlideRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc();
    }

    @Override
    public List<HeroSlide> getAllSlides() {
        return heroSlideRepository.findAllByOrderByDisplayOrderAscIdAsc();
    }

    @Override
    public HeroSlide createSlide(HeroSlideRequest request) {
        HeroSlide slide = new HeroSlide();
        applyRequest(slide, request);
        return heroSlideRepository.save(slide);
    }

    @Override
    public HeroSlide updateSlide(Long id, HeroSlideRequest request) {
        HeroSlide slide = heroSlideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hero slide not found"));

        applyRequest(slide, request);
        return heroSlideRepository.save(slide);
    }

    @Override
    public void deleteSlide(Long id) {
        HeroSlide slide = heroSlideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hero slide not found"));
        heroSlideRepository.delete(slide);
    }

    @Override
    @Transactional
    public void reorderSlides(List<Long> slideIds) {
        if (slideIds == null || slideIds.isEmpty()) {
            return;
        }

        Map<Long, HeroSlide> existingSlidesById = new HashMap<>();
        for (HeroSlide slide : heroSlideRepository.findAllById(slideIds)) {
            existingSlidesById.put(slide.getId(), slide);
        }

        int displayOrder = 1;
        for (Long slideId : slideIds) {
            HeroSlide slide = existingSlidesById.get(slideId);
            if (slide == null) {
                continue;
            }
            slide.setDisplayOrder(displayOrder++);
            heroSlideRepository.save(slide);
        }
    }

    private void applyRequest(HeroSlide slide, HeroSlideRequest request) {
        slide.setLabel(request.getLabel().trim());
        slide.setTitle(request.getTitle().trim());
        slide.setSubtitle(request.getSubtitle().trim());
        slide.setImageUrl(request.getImageUrl().trim());
        slide.setTextPosition(normalizeTextPosition(request.getTextPosition()));
        slide.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
        slide.setActive(request.getActive() == null || request.getActive());
    }

    private String normalizeTextPosition(String value) {
        if (value == null || value.isBlank()) {
            return "LEFT";
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return ALLOWED_TEXT_POSITIONS.contains(normalized) ? normalized : "LEFT";
    }
}
