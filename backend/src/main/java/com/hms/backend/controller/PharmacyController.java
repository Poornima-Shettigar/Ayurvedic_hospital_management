package com.hms.backend.controller;

import com.hms.backend.dto.pharmacy.DispenseRequest;
import com.hms.backend.dto.pharmacy.DispenseResponse;
import com.hms.backend.dto.pharmacy.MedicineRequest;
import com.hms.backend.dto.pharmacy.MedicineResponse;
import com.hms.backend.dto.pharmacy.RestockRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/medicines")
    public ResponseEntity<List<MedicineResponse>> getAll() {
        return ResponseEntity.ok(pharmacyService.getAll());
    }

    @GetMapping("/medicines/{id}")
    public ResponseEntity<MedicineResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pharmacyService.getById(id));
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponse> create(@Valid @RequestBody MedicineRequest req) {
        return ResponseEntity.ok(pharmacyService.create(req));
    }

    @PutMapping("/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponse> update(@PathVariable Long id, @Valid @RequestBody MedicineRequest req) {
        return ResponseEntity.ok(pharmacyService.update(id, req));
    }

    @DeleteMapping("/medicines/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pharmacyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/medicines/{id}/restock")
    public ResponseEntity<MedicineResponse> restock(@PathVariable Long id, @Valid @RequestBody RestockRequest req) {
        return ResponseEntity.ok(pharmacyService.restock(id, req));
    }

    @PostMapping("/dispense")
    public ResponseEntity<DispenseResponse> dispense(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DispenseRequest req) {
        return ResponseEntity.ok(pharmacyService.dispense(principal.getUsername(), req));
    }

    @GetMapping("/dispense-history")
    public ResponseEntity<List<DispenseResponse>> getDispenseHistory() {
        return ResponseEntity.ok(pharmacyService.getDispenseHistory());
    }
}
