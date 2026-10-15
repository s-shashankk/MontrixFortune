package com.montrixfortune.serviceImpl;
import com.montrixfortune.entity.Product;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.ProductRepository;
import com.montrixfortune.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService{
    private final ProductRepository productRepository;


    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryNameIgnoreCase(category);
    }

    @Override
    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Override
    @Transactional
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setName(updatedProduct.getName());
        product.setCategory(updatedProduct.getCategory());
        product.setPrice(updatedProduct.getPrice());
        product.setStockQuantity(updatedProduct.getStockQuantity());
        product.setImageUrl(updatedProduct.getImageUrl());
        product.setDescription(updatedProduct.getDescription());

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        productRepository.delete(product);
    }

    @Override
    public Page<Product> getProducts(int page, int size) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));

        return productRepository.findAll(pageable);
    }
}