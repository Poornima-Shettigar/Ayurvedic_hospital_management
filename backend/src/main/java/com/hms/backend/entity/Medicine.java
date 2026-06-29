package com.hms.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String genericName;

    private String manufacturer;

    /** Free-text category, e.g. Tablet, Syrup, Injection */
    private String category;

    /** e.g. "500mg", "100ml" */
    private String unit;

    @Column(nullable = false)
    private BigDecimal pricePerUnit;

    @Builder.Default
    @Column(nullable = false)
    private int stockQuantity = 0;

    @Builder.Default
    @Column(nullable = false)
    private int reorderLevel = 10;

    private LocalDate expiryDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
