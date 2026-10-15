package com.montrixfortune.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "hero_slides")
@Data
@EqualsAndHashCode(callSuper = false)
public class HeroSlide extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 1000)
    private String subtitle;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String textPosition = "LEFT";

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;
}
