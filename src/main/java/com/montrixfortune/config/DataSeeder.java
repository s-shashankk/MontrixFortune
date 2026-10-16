package com.montrixfortune.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.montrixfortune.entity.Category;
import com.montrixfortune.entity.HeroSlide;
import com.montrixfortune.entity.Project;
import com.montrixfortune.entity.Product;
import com.montrixfortune.entity.User;
import com.montrixfortune.enums.UserRole;
import com.montrixfortune.repository.CartItemRepository;
import com.montrixfortune.repository.CategoryRepository;
import com.montrixfortune.repository.HeroSlideRepository;
import com.montrixfortune.repository.OrderItemRepository;
import com.montrixfortune.repository.ProjectRepository;
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
    private final ProjectRepository projectRepository;
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
            seedProjects();
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

    // ---------------------------------------------------------------- our projects (sample content, editable in Admin > Our Projects)

    private void seedProjects() {
        if (projectRepository.count() > 0) {
            return;
        }
        projectRepository.saveAll(List.of(
                buildProject("Lakeview Apartment Makeover",
                        "A 3-BHK apartment overlooking the lake, furnished from the bare shell to move-in ready in just five weeks.\n\n"
                                + "We paired a warm sand palette with teal and terracotta accents, a velvet 3-seater sofa for the living room, a "
                                + "walnut dining set that seats six, and an upholstered king bed with matching bedside tables. Every piece was "
                                + "chosen to keep the rooms bright, open and easy to live in.",
                        "lakeview", 8, 1),
                buildProject("Heritage Villa Living Room",
                        "A classic villa living room brought up to date without losing its character.\n\n"
                                + "Sheesham wood furniture, a deep sectional sofa and layered lighting create a space that feels grand yet "
                                + "welcoming. Custom bookshelves and a handwoven jute rug tie the old architecture to a modern, comfortable layout.",
                        "heritage", 5, 2),
                buildProject("Sunrise Cafe & Lounge",
                        "Seating and decor for a 40-cover neighbourhood cafe designed to keep guests lingering.\n\n"
                                + "A long counter with brass-topped stools, pendant lights over every table and a mix of lounge chairs and "
                                + "bistro seating make the room work for quick coffees and long conversations. All furniture is hard-wearing and easy to clean.",
                        "cafe", 6, 3),
                buildProject("Urban Studio Loft",
                        "Smart, space-saving furniture that turns a compact studio into a home and a workspace.\n\n"
                                + "A storage bed, a fold-away dining table and a tall bookshelf wall keep the floor clear, while a dedicated "
                                + "desk corner by the window makes working from home comfortable.",
                        "loft", 4, 4),
                buildProject("Green Valley Farmhouse Dining",
                        "A weekend farmhouse built for big family meals and slow afternoons.\n\n"
                                + "A solid wood 8-seater dining table, cane-back chairs and a sideboard anchor the dining hall, "
                                + "with cosy living-room seating and plenty of greenery to match the view outside.",
                        "farmhouse", 5, 5),
                buildProject("Boutique Hotel Suites",
                        "Seven guest suites furnished for comfort, durability and a consistent look from room to room.\n\n"
                                + "Upholstered headboards, premium mattresses, bedside storage and a small lounge corner in each suite. "
                                + "We supplied, delivered and installed everything in one phase so the hotel opened on schedule.",
                        "hotel", 7, 6)
        ));
    }

    /** Sample images ship with the frontend under /public/projects (e.g. /projects/lakeview-1.svg). */
    private Project buildProject(String title, String description, String imagePrefix, int imageCount, int displayOrder) {
        Project project = new Project();
        project.setTitle(title);
        project.setDescription(description);
        for (int i = 1; i <= imageCount; i++) {
            project.getImages().add("/projects/" + imagePrefix + "-" + i + ".svg");
        }
        project.setDisplayOrder(displayOrder);
        project.setActive(true);
        return project;
    }
}
