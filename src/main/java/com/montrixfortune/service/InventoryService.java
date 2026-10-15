package com.montrixfortune.service;

import com.montrixfortune.entity.Product;

public interface InventoryService {
    boolean checkStock(Long productId, int quantity);
    void decrementStock(Long productId, int quantity);
    void incrementStock(Long productId, int quantity);
    Product getProduct(Long productId);
}