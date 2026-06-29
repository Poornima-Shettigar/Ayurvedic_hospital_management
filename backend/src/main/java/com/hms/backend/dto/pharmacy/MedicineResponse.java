package com.hms.backend.dto.pharmacy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class MedicineResponse {
    private Long id;
    private String name;
    private String genericName;
    private String manufacturer;
    private String category;
    private String unit;
    private BigDecimal pricePerUnit;
    private int stockQuantity;
    private int reorderLevel;
    private LocalDate expiryDate;
    private boolean lowStock;
}
