package com.montrixfortune.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.montrixfortune.entity.BaseEntity;
import com.montrixfortune.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    // Helps Admin block or unblock users
    @Column(nullable = false)
    private Boolean isActive = true;
}