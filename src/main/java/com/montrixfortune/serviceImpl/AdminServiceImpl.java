package com.montrixfortune.serviceImpl;

import com.montrixfortune.dto.order.admin.AdminOrderDetailResponse;
import com.montrixfortune.dto.order.admin.AdminOrderSummaryResponse;
import com.montrixfortune.entity.*;
import com.montrixfortune.enums.OrderStatus;
import com.montrixfortune.enums.PaymentCollectionStatus;
import com.montrixfortune.exception.CartValidationException;
import com.montrixfortune.exception.OperationNotAllowedException;
import com.montrixfortune.exception.ResourceNotFoundException;
import com.montrixfortune.repository.*;
import com.montrixfortune.service.AdminService;
import com.montrixfortune.dto.category.CategoryRequest;
import com.montrixfortune.dto.product.ProductRequest;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Page<User> getAllUsers(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return userRepository.findAll(pageable);
    }
    
    @Override
    public User updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(isActive);
        return userRepository.save(user);
    }

    @Override
    public Page<AdminOrderSummaryResponse> getAllOrders(int page, int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("orderDate"), Sort.Order.desc("id"))
        );

        return orderRepository.findAllBy(pageable).map(this::toAdminOrderSummaryResponse);
    }

    @Override
    public AdminOrderDetailResponse getOrderDetailsById(Long orderId) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return toAdminOrderDetailResponse(order);
    }

    @Override
    @Transactional
    public AdminOrderSummaryResponse updateOrderStatus(Long orderId, String status) {

        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus newStatus = parseOrderStatus(status);
        OrderStatus currentStatus = order.getOrderStatus();

        if (newStatus == currentStatus) {
            return toAdminOrderSummaryResponse(order);
        }

        java.util.List<OrderStatus> flow = java.util.List.of(
                OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PACKING,
                OrderStatus.OUT_FOR_SHIPMENT, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new OperationNotAllowedException("A " + currentStatus + " order can no longer be changed");
        }
        if (newStatus == OrderStatus.ORDER_FAILED) {
            throw new OperationNotAllowedException("ORDER_FAILED is set automatically by the payment system");
        }
        if (newStatus != OrderStatus.CANCELLED
                && flow.indexOf(newStatus) <= flow.indexOf(currentStatus)) {
            throw new OperationNotAllowedException("Cannot move an order from " + currentStatus + " back to " + newStatus);
        }

        // ORDER_FAILED orders already gave their stock back, so only restore for the other states.
        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.ORDER_FAILED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setOrderStatus(newStatus);

        Order savedOrder = orderRepository.save(order);
        return toAdminOrderSummaryResponse(savedOrder);
    }

    @Override
    @Transactional
    public AdminOrderSummaryResponse updateOrderPaymentCollectionStatus(Long orderId, String paymentCollectionStatus) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPaymentMethod() != com.montrixfortune.enums.PaymentMethod.COD) {
            throw new CartValidationException("Only COD orders can be manually updated between COD and PAID");
        }

        if (paymentCollectionStatus == null || paymentCollectionStatus.isBlank()) {
            throw new CartValidationException("Payment collection status is required");
        }

        String normalizedStatus = paymentCollectionStatus.trim().toUpperCase(Locale.ROOT);
        PaymentCollectionStatus newStatus;

        try {
            newStatus = PaymentCollectionStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException ex) {
            throw new CartValidationException("Invalid payment collection status: " + paymentCollectionStatus);
        }

        order.setPaymentCollectionStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return toAdminOrderSummaryResponse(savedOrder);
    }

    private OrderStatus parseOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new CartValidationException("Order status is required");
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);

        if ("PAID".equals(normalizedStatus) || "PAYED".equals(normalizedStatus)) {
            return OrderStatus.CONFIRMED;
        }

        if ("OUT FOR SHIPMENT".equals(normalizedStatus) || "OUT_FOR_DELIVERY".equals(normalizedStatus)) {
            return OrderStatus.OUT_FOR_SHIPMENT;
        }

        try {
            return OrderStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException ex) {
            throw new CartValidationException("Invalid order status: " + status);
        }
    }

        private AdminOrderSummaryResponse toAdminOrderSummaryResponse(Order order) {
        User user = order.getUser();
        Address address = order.getShippingAddress();

            String customerName = user != null ? user.getName() : null;
            if ((customerName == null || customerName.isBlank()) && address != null) {
                customerName = address.getFullName();
            }

            String customerPhone = user != null ? user.getPhone() : null;
        if ((customerPhone == null || customerPhone.isBlank()) && address != null) {
            customerPhone = address.getPhoneNumber();
        }

            String customerEmail = user != null ? user.getEmail() : null;

        List<AdminOrderSummaryResponse.ItemPreview> itemPreviews = order.getItems() == null
            ? List.of()
            : order.getItems().stream().map(item -> new AdminOrderSummaryResponse.ItemPreview(
                item.getId(),
                item.getProduct() != null ? item.getProduct().getName() : "Unknown Product",
                item.getProduct() != null ? item.getProduct().getImageUrl() : null,
                item.getQuantity()
            )).toList();

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        AdminOrderSummaryResponse response = new AdminOrderSummaryResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setOrderDate(order.getOrderDate());
        response.setOrderStatus(order.getOrderStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentFailureReason(order.getPaymentFailureReason());
        response.setItems(itemPreviews);
        response.setCustomerName(customerName);
        response.setCustomerEmail(customerEmail);
        response.setCustomerPhone(customerPhone);
        response.setFullName(address != null ? address.getFullName() : null);
        response.setStreetAddress(address != null ? address.getStreetAddress() : null);
        response.setCity(address != null ? address.getCity() : null);
        response.setState(address != null ? address.getState() : null);
        response.setPostalCode(address != null ? address.getPostalCode() : null);
        response.setCountry(address != null ? address.getCountry() : null);
        response.setPaymentCollectionStatus(order.getPaymentCollectionStatus());
        response.setGatewayPaymentStatus(payment != null ? payment.getPaymentStatus() : null);
        return response;
        }

        private AdminOrderDetailResponse toAdminOrderDetailResponse(Order order) {
        User user = order.getUser();
        Address address = order.getShippingAddress();

        String fallbackName = address != null ? address.getFullName() : null;
        String fallbackPhone = address != null ? address.getPhoneNumber() : null;

        AdminOrderDetailResponse.Customer customer = new AdminOrderDetailResponse.Customer(
            user != null ? user.getId() : null,
            user != null && user.getName() != null && !user.getName().isBlank() ? user.getName() : fallbackName,
            user != null ? user.getEmail() : null,
            user != null && user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : fallbackPhone
        );

        AdminOrderDetailResponse.ShippingAddress shippingAddress = null;
        if (address != null) {
            shippingAddress = new AdminOrderDetailResponse.ShippingAddress(
                address.getId(),
                address.getFullName(),
                address.getStreetAddress(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getPhoneNumber()
            );
        }

        List<AdminOrderDetailResponse.Item> items = order.getItems() == null
            ? List.of()
            : order.getItems().stream().map(orderItem -> {
                Product product = orderItem.getProduct();
                AdminOrderDetailResponse.ProductInfo productInfo = product == null
                    ? null
                    : new AdminOrderDetailResponse.ProductInfo(
                        product.getId(),
                        product.getName(),
                        product.getImageUrl(),
                        product.getCategory() != null ? product.getCategory().getName() : null
                    );

                BigDecimal unitPrice = orderItem.getPrice();
                BigDecimal subtotal = unitPrice == null
                    ? BigDecimal.ZERO
                    : unitPrice.multiply(BigDecimal.valueOf(orderItem.getQuantity() == null ? 0 : orderItem.getQuantity()));

                return new AdminOrderDetailResponse.Item(
                    orderItem.getId(),
                    orderItem.getQuantity(),
                    unitPrice,
                    subtotal,
                    productInfo
                );
            }).toList();

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        AdminOrderDetailResponse.PaymentInfo paymentInfo = null;
        if (payment != null) {
            paymentInfo = new AdminOrderDetailResponse.PaymentInfo(
                payment.getId(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getFailureReason(),
                payment.getPaymentDate()
            );
        }

        return new AdminOrderDetailResponse(
            order.getId(),
            order.getTotalAmount(),
            order.getOrderDate(),
            order.getOrderStatus(),
            order.getPaymentMethod(),
            order.getPaymentCollectionStatus(),
            order.getPaymentFailureReason(),
            customer,
            shippingAddress,
            items,
            paymentInfo
        );
        }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
            .sorted(Comparator
                .comparing((Product product) -> product.getCategory() == null
                    ? "zzzz"
                    : product.getCategory().getName().toLowerCase(Locale.ROOT))
                .thenComparing(product -> product.getName() == null
                    ? ""
                    : product.getName().toLowerCase(Locale.ROOT)))
            .toList();
    }
    
    @Override
    public Product createProduct(ProductRequest request) {
        Category category = resolveCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        product.setImageUrl(request.getImageUrl() != null ? request.getImageUrl() : "");
        product.setCategory(category);
        return productRepository.save(product);
    }

    @Override
        public Product updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (request.getCategoryId() != null) {
            product.setCategory(resolveCategory(request.getCategoryId()));
        }

        product.setName(request.getName());
        product.setPrice(request.getPrice() != null ? request.getPrice() : product.getPrice());
        product.setDescription(request.getDescription());
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (orderItemRepository.existsByProduct(product)) {
            throw new OperationNotAllowedException(
                    "This product is part of an existing order and cannot be deleted. Edit it instead."
            );
        }

        cartItemRepository.deleteByProduct(product);

        productRepository.delete(product);
    }
    
    @Override
    @Transactional
    public Category createCategory(CategoryRequest request) {
        String normalizedName = normalizeCategoryName(request.getName());
        categoryRepository.findByNameIgnoreCase(normalizedName).ifPresent(existingCategory -> {
            throw new OperationNotAllowedException("Category already exists. Please select it from the list.");
        });

        Category category = new Category();
        category.setName(normalizedName);
        category.setDescription(request.getDescription());
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(category -> category.getName().toLowerCase(Locale.ROOT)))
                .toList();
    }

    @Override
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(normalizeCategoryName(request.getName()));
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    @Override
    public Page<Payment> getAllPayments(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return paymentRepository.findAll(pageable);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalProducts", productRepository.count());
        return stats;
    }

    private Category resolveCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private String normalizeCategoryName(String categoryName) {
        return categoryName == null ? "" : categoryName.trim();
    }
}