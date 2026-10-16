package com.montrixfortune.controller;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.product.ProductRequest;
import com.montrixfortune.entity.Category;
import com.montrixfortune.entity.Product;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.CategoryRepository;
import com.montrixfortune.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductService productService, CategoryRepository categoryRepository) {
        this.productService = productService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public Page<Product> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Product> result = productService.getProducts(page, size);
        result.getContent().forEach(this::fillImageCount);
        return result;
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {

        Product product = productService.getProductById(id);
        product.setImages(product.allImages());
        return product;
    }

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(@PathVariable String category) {

        List<Product> list = productService.getProductsByCategory(category);
        list.forEach(this::fillImageCount);
        return list;
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {

        List<Product> list = productService.searchProducts(keyword);
        list.forEach(this::fillImageCount);
        return list;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = toProductEntity(request, new Product());
        Product saved = productService.addProduct(product);
        return new ApiResponse<>(true, "Product created", 201, LocalDateTime.now(), saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product existing = productService.getProductById(id);
        Product updatedInput = toProductEntity(request, existing);
        Product updated = productService.updateProduct(id, updatedInput);
        return new ApiResponse<>(true, "Product updated", 200, LocalDateTime.now(), updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ApiResponse<>(true, "Product deleted", 200, LocalDateTime.now(), null);
    }

    private void fillImageCount(Product product) {
        product.setImageCount(product.allImages().size());
    }

    private Product toProductEntity(ProductRequest request, Product product) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrls() != null) {
            product.applyImageList(request.getImageUrls());
        } else {
            product.setImageUrl(request.getImageUrl() == null ? "" : request.getImageUrl());
        }
        product.setCategory(category);
        return product;
    }
}