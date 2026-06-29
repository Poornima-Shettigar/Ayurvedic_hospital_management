package com.hms.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_dispenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDispense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispensed_by", nullable = false)
    private User dispensedBy;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal unitPriceAtDispense;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(length = 300)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dispensedAt;

    @PrePersist
    protected void onCreate() {
        this.dispensedAt = LocalDateTime.now();
    }
}
