package com.montrixfortune.repository;

import com.montrixfortune.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryId(Long categoryId);
    Optional<SubCategory> findByCategoryIdAndNameIgnoreCase(Long categoryId, String name);
    void deleteByCategoryId(Long categoryId);
}
