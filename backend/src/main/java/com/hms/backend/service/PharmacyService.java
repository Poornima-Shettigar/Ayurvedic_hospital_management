package com.hms.backend.service;

import com.hms.backend.dto.pharmacy.DispenseRequest;
import com.hms.backend.dto.pharmacy.DispenseResponse;
import com.hms.backend.dto.pharmacy.MedicineRequest;
import com.hms.backend.dto.pharmacy.MedicineResponse;
import com.hms.backend.dto.pharmacy.RestockRequest;
import com.hms.backend.entity.Medicine;
import com.hms.backend.entity.MedicineDispense;
import com.hms.backend.entity.Patient;
import com.hms.backend.entity.User;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.MedicineDispenseRepository;
import com.hms.backend.repository.MedicineRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PharmacyService {

    private final MedicineRepository medicineRepository;
    private final MedicineDispenseRepository dispenseRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public List<MedicineResponse> getAll() {
        return medicineRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public MedicineResponse getById(Long id) {
        return mapToResponse(findMedicine(id));
    }

    @Transactional
    public MedicineResponse create(MedicineRequest req) {
        Medicine medicine = Medicine.builder()
                .name(req.getName())
                .genericName(req.getGenericName())
                .manufacturer(req.getManufacturer())
                .category(req.getCategory())
                .unit(req.getUnit())
                .pricePerUnit(req.getPricePerUnit())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .reorderLevel(req.getReorderLevel() != null ? req.getReorderLevel() : 10)
                .expiryDate(req.getExpiryDate())
                .build();
        return mapToResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineResponse update(Long id, MedicineRequest req) {
        Medicine medicine = findMedicine(id);
        medicine.setName(req.getName());
        medicine.setGenericName(req.getGenericName());
        medicine.setManufacturer(req.getManufacturer());
        medicine.setCategory(req.getCategory());
        medicine.setUnit(req.getUnit());
        medicine.setPricePerUnit(req.getPricePerUnit());
        if (req.getStockQuantity() != null) medicine.setStockQuantity(req.getStockQuantity());
        if (req.getReorderLevel() != null) medicine.setReorderLevel(req.getReorderLevel());
        medicine.setExpiryDate(req.getExpiryDate());
        return mapToResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public void delete(Long id) {
        medicineRepository.delete(findMedicine(id));
    }

    @Transactional
    public MedicineResponse restock(Long id, RestockRequest req) {
        Medicine medicine = findMedicine(id);
        medicine.setStockQuantity(medicine.getStockQuantity() + req.getQuantity());
        return mapToResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public DispenseResponse dispense(String dispensedByEmail, DispenseRequest req) {
        Medicine medicine = findMedicine(req.getMedicineId());

        if (medicine.getStockQuantity() < req.getQuantity()) {
            throw new BadRequestException(
                    "Not enough stock for " + medicine.getName() + " (only " + medicine.getStockQuantity() + " left)");
        }

        Patient patient = null;
        if (req.getPatientId() != null) {
            patient = patientRepository.findById(req.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        }

        User dispensedBy = userRepository.findByEmail(dispensedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        medicine.setStockQuantity(medicine.getStockQuantity() - req.getQuantity());
        medicineRepository.save(medicine);

        BigDecimal totalPrice = medicine.getPricePerUnit().multiply(BigDecimal.valueOf(req.getQuantity()));

        MedicineDispense dispense = MedicineDispense.builder()
                .medicine(medicine)
                .patient(patient)
                .dispensedBy(dispensedBy)
                .quantity(req.getQuantity())
                .unitPriceAtDispense(medicine.getPricePerUnit())
                .totalPrice(totalPrice)
                .notes(req.getNotes())
                .build();

        return mapToDispenseResponse(dispenseRepository.save(dispense));
    }

    public List<DispenseResponse> getDispenseHistory() {
        return dispenseRepository.findAllByOrderByDispensedAtDesc().stream()
                .map(this::mapToDispenseResponse).toList();
    }

    private Medicine findMedicine(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));
    }

    private MedicineResponse mapToResponse(Medicine m) {
        return MedicineResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .genericName(m.getGenericName())
                .manufacturer(m.getManufacturer())
                .category(m.getCategory())
                .unit(m.getUnit())
                .pricePerUnit(m.getPricePerUnit())
                .stockQuantity(m.getStockQuantity())
                .reorderLevel(m.getReorderLevel())
                .expiryDate(m.getExpiryDate())
                .lowStock(m.getStockQuantity() <= m.getReorderLevel())
                .build();
    }

    private DispenseResponse mapToDispenseResponse(MedicineDispense d) {
        return DispenseResponse.builder()
                .id(d.getId())
                .medicineId(d.getMedicine().getId())
                .medicineName(d.getMedicine().getName())
                .patientId(d.getPatient() != null ? d.getPatient().getId() : null)
                .patientName(d.getPatient() != null ? d.getPatient().getUser().getFullName() : "Walk-in")
                .quantity(d.getQuantity())
                .unitPriceAtDispense(d.getUnitPriceAtDispense())
                .totalPrice(d.getTotalPrice())
                .dispensedByName(d.getDispensedBy().getFullName())
                .dispensedAt(d.getDispensedAt())
                .notes(d.getNotes())
                .build();
    }
}
