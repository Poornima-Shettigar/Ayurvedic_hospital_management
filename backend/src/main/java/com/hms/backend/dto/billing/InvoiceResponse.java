package com.hms.backend.dto.billing;

import com.hms.backend.enums.InvoiceStatus;
import com.hms.backend.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private InvoiceStatus status;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private PaymentMethod paymentMethod;
    private String notes;
    private LocalDate issueDate;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<InvoiceItemResponse> items;
}
