package com.hms.backend.repository;

import com.hms.backend.entity.MedicineDispense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineDispenseRepository extends JpaRepository<MedicineDispense, Long> {
    List<MedicineDispense> findByPatient_IdOrderByDispensedAtDesc(Long patientId);
    List<MedicineDispense> findAllByOrderByDispensedAtDesc();
}
