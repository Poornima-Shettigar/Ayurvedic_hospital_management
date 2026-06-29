package com.hms.backend.dto.pharmacy;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DispenseRequest {

    @NotNull(message = "Medicine is required")
    private Long medicineId;

    /** Optional — leave blank for an over-the-counter / walk-in sale */
    private Long patientId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String notes;
}
