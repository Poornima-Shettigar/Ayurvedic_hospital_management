package com.hms.backend.service;

import com.hms.backend.dto.patient.PatientResponse;
import com.hms.backend.dto.patient.PatientUpdateRequest;
import com.hms.backend.entity.Patient;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientResponse getMyProfile(String email) {
        Patient patient = patientRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return mapToResponse(patient);
    }

    public PatientResponse updateMyProfile(String email, PatientUpdateRequest req) {
        Patient patient = patientRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        if (req.getPhone() != null) patient.getUser().setPhone(req.getPhone());
        if (req.getDateOfBirth() != null) patient.setDateOfBirth(req.getDateOfBirth());
        if (req.getGender() != null) patient.setGender(req.getGender());
        if (req.getAddress() != null) patient.setAddress(req.getAddress());
        if (req.getBloodGroup() != null) patient.setBloodGroup(req.getBloodGroup());

        return mapToResponse(patientRepository.save(patient));
    }

    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .fullName(patient.getUser().getFullName())
                .email(patient.getUser().getEmail())
                .phone(patient.getUser().getPhone())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }
}
