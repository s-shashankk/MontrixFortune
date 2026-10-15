package com.montrixfortune.controller.admin;

import com.montrixfortune.dto.ApiResponse;
import com.montrixfortune.dto.category.CategoryRequest;
import com.montrixfortune.dto.order.admin.AdminOrderDetailResponse;
import com.montrixfortune.dto.order.admin.AdminOrderSummaryResponse;
import com.montrixfortune.dto.product.ProductRequest;
import com.montrixfortune.entity.*;
import com.montrixfortune.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<User> users = adminService.getAllUsers(page, size);
        return new ApiResponse<>(true, "Users fetched", 200, java.time.LocalDateTime.now(), users);
    }

    @GetMapping("/orders")
    public ApiResponse<Page<AdminOrderSummaryResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AdminOrderSummaryResponse> orders = adminService.getAllOrders(page, size);
        return new ApiResponse<>(true, "Orders fetched", 200, java.time.LocalDateTime.now(), orders);
    }

    @GetMapping("/orders/{orderId}")
    public ApiResponse<AdminOrderDetailResponse> getOrderDetails(@PathVariable Long orderId) {
        AdminOrderDetailResponse orderDetails = adminService.getOrderDetailsById(orderId);
        return new ApiResponse<>(true, "Order details fetched", 200, java.time.LocalDateTime.now(), orderDetails);
    }

    @PutMapping("/orders/{orderId}")
    public ApiResponse<AdminOrderSummaryResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status){
        AdminOrderSummaryResponse order = adminService.updateOrderStatus(orderId, status);
        return new ApiResponse<>(true, "Order status updated", 200, java.time.LocalDateTime.now(), order);
    }

    @PutMapping("/orders/{orderId}/payment-collection")
    public ApiResponse<AdminOrderSummaryResponse> updateOrderPaymentCollectionStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        AdminOrderSummaryResponse order = adminService.updateOrderPaymentCollectionStatus(orderId, status);
        return new ApiResponse<>(true, "Order payment collection status updated", 200, java.time.LocalDateTime.now(), order);
    }

    @GetMapping("/products")
    public ApiResponse<List<Product>> getProducts(){
        List<Product> products = adminService.getAllProducts();
        return new ApiResponse<>(true, "Products fetched", 200, java.time.LocalDateTime.now(), products);
    }

    @PostMapping("/products")
    public ApiResponse<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = adminService.createProduct(request);
        return new ApiResponse<>(true, "Product created", 201, java.time.LocalDateTime.now(), product);
    }

    @PutMapping("/products/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        Product product = adminService.updateProduct(id, request);
        return new ApiResponse<>(true, "Product updated", 200, java.time.LocalDateTime.now(), product);
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id){
        adminService.deleteProduct(id);
        return new ApiResponse<>(true, "Product deleted", 200, java.time.LocalDateTime.now(), null);
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return adminService.getAllCategories();
    }

    @PostMapping("/categories")
    public ApiResponse<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        Category category = adminService.createCategory(request);
        return new ApiResponse<>(true, "Category created", 201, java.time.LocalDateTime.now(), category);
    }

    @GetMapping("/payments")
    public Page<Payment> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return adminService.getAllPayments(page, size);
    }
}