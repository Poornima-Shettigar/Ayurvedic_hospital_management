package com.hms.backend.controller;

import com.hms.backend.dto.auth.JwtResponse;
import com.hms.backend.dto.auth.LoginRequest;
import com.hms.backend.dto.auth.RegisterDoctorRequest;
import com.hms.backend.dto.auth.RegisterPatientRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/patient")
    public ResponseEntity<JwtResponse> registerPatient(@Valid @RequestBody RegisterPatientRequest req) {
        return ResponseEntity.ok(authService.registerPatient(req));
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<JwtResponse> registerDoctor(@Valid @RequestBody RegisterDoctorRequest req) {
        return ResponseEntity.ok(authService.registerDoctor(req));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<JwtResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getUsername()));
    }
}
