package com.hms.backend.repository;

import com.hms.backend.entity.Invoice;
import com.hms.backend.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatient_IdOrderByIssueDateDescIdDesc(Long patientId);
    List<Invoice> findAllByOrderByIssueDateDescIdDesc();
    long countByStatus(InvoiceStatus status);
}
