package com.hms.backend.controller;

import com.hms.backend.dto.staff.StaffCreateRequest;
import com.hms.backend.dto.staff.StaffResponse;
import com.hms.backend.dto.staff.StaffUpdateRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    // ---- Admin-managed staff directory ----

    @GetMapping("/api/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffResponse>> getAll() {
        return ResponseEntity.ok(staffService.getAll());
    }

    @PostMapping("/api/admin/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> create(@Valid @RequestBody StaffCreateRequest req) {
        return ResponseEntity.ok(staffService.create(req));
    }

    @GetMapping("/api/admin/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getById(id));
    }

    @PutMapping("/api/admin/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> update(@PathVariable Long id, @RequestBody StaffUpdateRequest req) {
        return ResponseEntity.ok(staffService.update(id, req));
    }

    @DeleteMapping("/api/admin/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Staff's own profile ----

    @GetMapping("/api/staff/me")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<StaffResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(staffService.getMyProfile(principal.getUsername()));
    }
}
