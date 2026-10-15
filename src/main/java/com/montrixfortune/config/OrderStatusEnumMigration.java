package com.montrixfortune.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStatusEnumMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Override
    public void run(ApplicationArguments args) {
        if (datasourceUrl == null || !datasourceUrl.toLowerCase().contains("mysql")) {
            return;
        }

        String sql = "ALTER TABLE orders " +
            "MODIFY COLUMN order_status ENUM('PENDING','CONFIRMED','ORDER_FAILED','PACKING','OUT_FOR_SHIPMENT','SHIPPED','DELIVERED','CANCELLED') NOT NULL";

        try {
            jdbcTemplate.execute(sql);
            log.info("Ensured MySQL enum values for orders.order_status include payment failure state");
        } catch (Exception ex) {
            log.warn("Could not alter orders.order_status enum automatically: {}", ex.getMessage());
        }
    }
}
