package com.montrixfortune.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.montrixfortune.entity.Category;
import com.montrixfortune.entity.HeroSlide;
import com.montrixfortune.entity.Product;
import com.montrixfortune.entity.User;
import com.montrixfortune.enums.UserRole;
import com.montrixfortune.repository.CartItemRepository;
import com.montrixfortune.repository.CategoryRepository;
import com.montrixfortune.repository.HeroSlideRepository;
import com.montrixfortune.repository.OrderItemRepository;
import com.montrixfortune.repository.ProductRepository;
import com.montrixfortune.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Start-up data. Safe to run on every start: it only fills what is missing.
 *
 * Settings (environment variables):
 *   ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME  create the first admin if that e-mail does not exist yet (password min 10 chars)
 *   APP_SEED_DEMO_USERS=true                   also create user@montrix.com / admin@montrix.com demo logins (LOCAL DEV ONLY)
 *   APP_SEED_CATALOG=true (default)            when the products table is empty, load catalog/products.json and default hero slides
 *   APP_SEED_REPLACE_CATALOG=true              one-off: remove old dummy "... Collection Item NN" products and add the curated catalog
 *                                              (admin-created products and products already used in orders are never deleted)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DUMMY_MARKER = " Collection Item ";

    public record CatalogItem(String category, String name, String description, BigDecimal price,
                       Integer stockQuantity, String imageUrl) {
    }

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final HeroSlideRepository heroSlideRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.seed.demo-users:false}")
    private boolean seedDemoUsers;

    @Value("${app.seed.catalog:true}")
    private boolean seedCatalog;

    @Value("${app.seed.replace-catalog:false}")
    private boolean replaceCatalog;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.name:Store Admin}")
    private String adminName;

    @Override
    public void run(String... args) throws Exception {
        ensureAdminFromEnvironment();
        if (seedDemoUsers) {
            ensureDemoUsers();
        }

        List<CatalogItem> catalog = loadCatalog();
        ensureCategories(catalog);

        if (replaceCatalog) {
            transactionTemplate.executeWithoutResult(status -> replaceDummyProducts(catalog));
        } else if (seedCatalog && productRepository.count() == 0) {
            transactionTemplate.executeWithoutResult(status -> insertMissingProducts(catalog));
        }

        if (seedCatalog) {
            seedHeroSlides();
        }

        List<User> usersWithNoRole = userRepository.findByRoleIsNull();
        if (!usersWithNoRole.isEmpty()) {
            usersWithNoRole.forEach(user -> user.setRole(UserRole.USER));
            userRepository.saveAll(usersWithNoRole);
        }
    }

    // ---------------------------------------------------------------- users

    private void ensureAdminFromEnvironment() {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }
        String email = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        if (adminPassword == null || adminPassword.length() < 10) {
            log.error("ADMIN_PASSWORD must be at least 10 characters. Admin account was NOT created.");
            return;
        }
        User admin = new User();
        admin.setName(adminName);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setPhone("0000000000");
        admin.setRole(UserRole.ADMIN);
        admin.setIsActive(true);
        userRepository.save(admin);
        log.info("Created admin account {}", email);
    }

    private void ensureDemoUsers() {
        log.warn("APP_SEED_DEMO_USERS is on: demo logins with well-known passwords exist. Never enable this in production.");
        createDemoUser("Dummy User", "user@montrix.com", "password123", "1234567890", UserRole.USER);
        createDemoUser("Super Admin", "admin@montrix.com", "admin123", "0987654321", UserRole.ADMIN);
    }

    private void createDemoUser(String name, String email, String password, String phone, UserRole role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(role);
        user.setIsActive(true);
        userRepository.save(user);
    }

    // ---------------------------------------------------------------- catalog

    private List<CatalogItem> loadCatalog() {
        try (InputStream in = new ClassPathResource("catalog/products.json").getInputStream()) {
            return objectMapper.readValue(in, new TypeReference<List<CatalogItem>>() {
            });
        } catch (Exception ex) {
            log.error("Could not read catalog/products.json: {}", ex.getMessage());
            return List.of();
        }
    }

    private static final Map<String, String> CATEGORY_DESCRIPTIONS = Map.of(
            "Living", "Sofas, chairs, tables and storage for the living room",
            "Bedroom", "Beds, wardrobes and bedroom furniture",
            "Dining", "Dining sets, tables, chairs and storage",
            "Mattress", "Foam, spring and hybrid mattresses",
            "Decor", "Lighting, mirrors, rugs and home accessories");

    private void ensureCategories(List<CatalogItem> catalog) {
        Set<String> names = catalog.stream().map(CatalogItem::category).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        if (names.isEmpty()) {
            names = CATEGORY_DESCRIPTIONS.keySet();
        }
        for (String name : names) {
            if (categoryRepository.findByNameIgnoreCase(name).isEmpty()) {
                Category category = new Category();
                category.setName(name);
                category.setDescription(CATEGORY_DESCRIPTIONS.getOrDefault(name, name));
                categoryRepository.save(category);
            }
        }
    }

    private void replaceDummyProducts(List<CatalogItem> catalog) {
        int deleted = 0;
        int kept = 0;
        for (Product product : productRepository.findAll()) {
            if (product.getName() == null || !product.getName().contains(DUMMY_MARKER)) {
                continue;
            }
            if (orderItemRepository.existsByProduct(product)) {
                product.setStockQuantity(0);
                productRepository.save(product);
                kept++;
                continue;
            }
            cartItemRepository.deleteByProduct(product);
            productRepository.delete(product);
            deleted++;
        }
        int added = insertMissingProducts(catalog);
        log.info("Catalog replace: removed {} dummy products, kept {} (already used in orders, stock set to 0), added {} curated products",
                deleted, kept, added);
    }

    private int insertMissingProducts(List<CatalogItem> catalog) {
        Set<String> existing = productRepository.findAll().stream()
                .map(p -> p.getName().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        Map<String, Category> categories = new HashMap<>();
        categoryRepository.findAll().forEach(c -> categories.put(c.getName().toLowerCase(Locale.ROOT), c));

        int added = 0;
        for (CatalogItem item : catalog) {
            if (existing.contains(item.name().toLowerCase(Locale.ROOT))) {
                continue;
            }
            Category category = categories.get(item.category().toLowerCase(Locale.ROOT));
            if (category == null) {
                continue;
            }
            Product product = new Product();
            product.setName(item.name());
            product.setDescription(item.description());
            product.setPrice(item.price());
            product.setStockQuantity(item.stockQuantity());
            product.setImageUrl(item.imageUrl());
            product.setCategory(category);
            productRepository.save(product);
            added++;
        }
        return added;
    }

    // ---------------------------------------------------------------- hero slides

    private void seedHeroSlides() {
        if (heroSlideRepository.count() > 0) {
            return;
        }
        heroSlideRepository.saveAll(List.of(
                buildHeroSlide("Modern Living", "Bring warmth to your everyday spaces",
                        "Curated sofas, tables, and decor pieces made for comfortable, beautiful homes.",
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1800&q=80", "LEFT", 1),
                buildHeroSlide("Dining Essentials", "Host, gather, and celebrate in style",
                        "From statement dining sets to minimalist accents, discover pieces built to last.",
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80", "CENTER", 2),
                buildHeroSlide("Bedroom Comfort", "Design your calmest corner",
                        "Soft textures, elegant finishes, and premium furniture for restful nights.",
                        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1800&q=80", "RIGHT", 3)
        ));
    }

    private HeroSlide buildHeroSlide(String label, String title, String subtitle, String imageUrl,
                                     String textPosition, int displayOrder) {
        HeroSlide slide = new HeroSlide();
        slide.setLabel(label);
        slide.setTitle(title);
        slide.setSubtitle(subtitle);
        slide.setImageUrl(imageUrl);
        slide.setTextPosition(textPosition);
        slide.setDisplayOrder(displayOrder);
        slide.setActive(true);
        return slide;
    }
}
