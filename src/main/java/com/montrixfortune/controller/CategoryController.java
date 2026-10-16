package com.montrixfortune.controller;

import com.montrixfortune.entity.Category;
import com.montrixfortune.entity.SubCategory;
import com.montrixfortune.repository.CategoryRepository;
import com.montrixfortune.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @GetMapping
    public List<Category> getCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(category -> category.getName().toLowerCase(Locale.ROOT)))
                .toList();
    }

    /** Public list used by the shop to show sub-category filters. */
    @GetMapping("/sub-categories")
    public List<SubCategory> getSubCategories() {
        return subCategoryRepository.findAll().stream()
                .sorted(Comparator.comparing(sub -> sub.getName().toLowerCase(Locale.ROOT)))
                .toList();
    }
}
