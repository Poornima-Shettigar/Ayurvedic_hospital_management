package com.hms.backend.controller;

import com.hms.backend.dto.patient.PatientResponse;
import com.hms.backend.dto.patient.PatientUpdateRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<PatientResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(patientService.getMyProfile(principal.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<PatientResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PatientUpdateRequest req) {
        return ResponseEntity.ok(patientService.updateMyProfile(principal.getUsername(), req));
    }
}
