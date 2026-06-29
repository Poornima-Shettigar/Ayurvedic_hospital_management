package com.hms.backend.dto.billing;

import com.hms.backend.enums.InvoiceItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class InvoiceItemResponse {
    private Long id;
    private InvoiceItemType itemType;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}
