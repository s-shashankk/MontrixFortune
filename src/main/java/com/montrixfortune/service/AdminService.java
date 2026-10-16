package com.montrixfortune.service;

import com.montrixfortune.dto.order.admin.AdminOrderDetailResponse;
import com.montrixfortune.dto.order.admin.AdminOrderSummaryResponse;
import com.montrixfortune.entity.*;
import org.springframework.data.domain.Page;
import com.montrixfortune.dto.category.CategoryRequest;
import com.montrixfortune.dto.category.SubCategoryRequest;
import com.montrixfortune.dto.product.ProductRequest;

import java.util.List;
import java.util.Map;

public interface AdminService {

    Page<User> getAllUsers(int page, int size);

    User updateUserStatus(Long userId, Boolean isActive);

    Page<AdminOrderSummaryResponse> getAllOrders(int page, int size);

    AdminOrderSummaryResponse updateOrderStatus(Long orderId, String status);

    AdminOrderSummaryResponse updateOrderPaymentCollectionStatus(Long orderId, String paymentCollectionStatus);

    AdminOrderDetailResponse getOrderDetailsById(Long orderId);

    List<Product> getAllProducts();

    Product createProduct(ProductRequest request);

    Product updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long productId);

    Category createCategory(CategoryRequest request);

    List<Category> getAllCategories();

    Category updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    List<SubCategory> getAllSubCategories();

    SubCategory createSubCategory(SubCategoryRequest request);

    SubCategory updateSubCategory(Long id, SubCategoryRequest request);

    void deleteSubCategory(Long id);

    Map<String, Object> getDashboardStats();

    Page<Payment> getAllPayments(int page, int size);
}