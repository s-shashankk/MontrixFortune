package com.montrixfortune.repository;

import com.montrixfortune.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    long countByCategoryId(Long categoryId);
    List<Product> findByCategoryNameIgnoreCase(String categoryName);
    List<Product> findByNameContainingIgnoreCase(String keyword);

    /** Locks the product row until the surrounding transaction ends (prevents overselling). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
