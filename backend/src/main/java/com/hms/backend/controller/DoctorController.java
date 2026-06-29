package com.hms.backend.controller;

import com.hms.backend.dto.appointment.TimeSlotResponse;
import com.hms.backend.dto.doctor.DoctorAvailabilityRequest;
import com.hms.backend.dto.doctor.DoctorResponse;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.AppointmentService;
import com.hms.backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getApprovedDoctors(
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(doctorService.getApprovedDoctors(departmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getById(id));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<TimeSlotResponse>> getSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(id, date));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(doctorService.getMyProfile(principal.getUsername()));
    }

    @PutMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> updateAvailability(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody DoctorAvailabilityRequest req) {
        return ResponseEntity.ok(doctorService.updateAvailability(principal.getUsername(), req));
    }
}
