package com.montrixfortune.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** A showcase "Our Projects" entry: up to 8 ordered images plus a title and description. */
@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project extends BaseEntity {

    public static final int MAX_IMAGES = 8;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    /** Ordered gallery; index 0 is the cover image shown in the home-page slideshow. */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_images", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Lob
    @Column(name = "image_url", columnDefinition = "LONGTEXT", nullable = false)
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;
}
