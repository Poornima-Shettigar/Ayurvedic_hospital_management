package com.hms.backend.dto.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class InvoiceCreateRequest {

    @NotNull(message = "Patient is required")
    private Long patientId;

    /** Optional — link the invoice to a specific appointment */
    private Long appointmentId;

    private String notes;

    @NotEmpty(message = "Add at least one line item")
    @Valid
    private List<InvoiceItemRequest> items;
}
