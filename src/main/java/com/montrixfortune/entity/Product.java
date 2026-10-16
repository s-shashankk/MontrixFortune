package com.montrixfortune.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.montrixfortune.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = false)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String imageUrl;

    /** Extra photos (side, back, detail). The cover photo stays in imageUrl so product lists stay light. */
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private List<String> galleryImages = new ArrayList<>();

    /** Full photo list (cover first). Filled only by the product-details endpoint, never stored. */
    @Transient
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonProperty("images")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> images;

    /** Number of photos (cover + gallery). Filled by the list endpoints so cards can show arrows. */
    @Transient
    @JsonProperty("imageCount")
    private Integer imageCount;

    public static final int MAX_IMAGES = 4;

    /** First image becomes the cover, the rest go to the gallery. At most 4 images are kept. */
    public void applyImageList(List<String> urls) {
        List<String> clean = new ArrayList<>();
        if (urls != null) {
            for (String url : urls) {
                if (url != null && !url.isBlank() && clean.size() < MAX_IMAGES) {
                    clean.add(url.trim());
                }
            }
        }
        this.imageUrl = clean.isEmpty() ? "" : clean.get(0);
        if (this.galleryImages == null) {
            this.galleryImages = new ArrayList<>();
        }
        this.galleryImages.clear();
        if (clean.size() > 1) {
            this.galleryImages.addAll(clean.subList(1, clean.size()));
        }
    }

    /** Cover image followed by the gallery images. */
    public List<String> allImages() {
        List<String> all = new ArrayList<>();
        if (imageUrl != null && !imageUrl.isBlank()) {
            all.add(imageUrl);
        }
        if (galleryImages != null) {
            all.addAll(galleryImages);
        }
        return all;
    }

    /** Optional: narrows the product down inside its category (e.g. Chairs -> Office Chairs). */
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sub_category_id")
    private SubCategory subCategory;

    // Links the product to a specific Category
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @JsonSerialize(as = Category.class)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}