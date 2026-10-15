package com.montrixfortune.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.montrixfortune.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "categories")
@Data
@EqualsAndHashCode(callSuper = false)
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    
    private String description;
}