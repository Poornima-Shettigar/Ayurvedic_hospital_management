package com.hms.backend.dto.pharmacy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String genericName;
    private String manufacturer;
    private String category;
    private String unit;

    @NotNull(message = "Price is required")
    private BigDecimal pricePerUnit;

    private Integer stockQuantity;
    private Integer reorderLevel;
    private LocalDate expiryDate;
}
