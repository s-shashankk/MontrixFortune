package com.montrixfortune.serviceImpl;

import com.montrixfortune.entity.Product;
import com.montrixfortune.exception.InsufficientStockException;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.ProductRepository;
import com.montrixfortune.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;

    @Override
    public boolean checkStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return product.getStockQuantity() >= quantity;
    }

    @Override
    @Transactional
    public void decrementStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product: " + productId);
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void incrementStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }

    @Override
    public Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
