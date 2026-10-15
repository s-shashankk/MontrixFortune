package com.montrixfortune.service;

import com.montrixfortune.entity.Product;
import org.springframework.data.domain.Page;


import java.util.List;

public interface ProductService {

    List<Product> getAllProducts();

    Product getProductById(Long id);

    List<Product> getProductsByCategory(String category);

    List<Product> searchProducts(String keyword);

    Product addProduct(Product product);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    Page<Product> getProducts(int page, int size);

}