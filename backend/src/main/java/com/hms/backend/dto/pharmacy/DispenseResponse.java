package com.hms.backend.dto.pharmacy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DispenseResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private Long patientId;
    private String patientName;
    private int quantity;
    private BigDecimal unitPriceAtDispense;
    private BigDecimal totalPrice;
    private String dispensedByName;
    private LocalDateTime dispensedAt;
    private String notes;
}
