package com.hms.backend.controller;

import com.hms.backend.dto.common.DashboardStatsResponse;
import com.hms.backend.dto.doctor.DoctorResponse;
import com.hms.backend.dto.patient.PatientResponse;
import com.hms.backend.service.AdminService;
import com.hms.backend.service.DoctorService;
import com.hms.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<DoctorResponse>> getPendingDoctors() {
        return ResponseEntity.ok(doctorService.getPendingDoctors());
    }

    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<DoctorResponse> approveDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.approveDoctor(id));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
}
