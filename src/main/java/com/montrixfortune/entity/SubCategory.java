package com.montrixfortune.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/** A sub-category belongs to one main Category (for example Chairs -> Office Chairs). */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "sub_categories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"category_id", "name"}))
@Data
@EqualsAndHashCode(callSuper = false)
public class SubCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @JsonProperty("categoryId")
    public Long categoryIdValue() {
        return category == null ? null : category.getId();
    }

    @JsonProperty("categoryName")
    public String categoryNameValue() {
        return category == null ? null : category.getName();
    }
}
