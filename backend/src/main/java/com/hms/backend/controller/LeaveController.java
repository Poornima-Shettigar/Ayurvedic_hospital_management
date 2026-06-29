package com.hms.backend.controller;

import com.hms.backend.dto.leave.LeaveRequestCreateRequest;
import com.hms.backend.dto.leave.LeaveResponse;
import com.hms.backend.dto.leave.LeaveStatusUpdateRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<LeaveResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LeaveRequestCreateRequest req) {
        return ResponseEntity.ok(leaveService.create(principal.getUsername(), req));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<List<LeaveResponse>> getMine(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(leaveService.getMine(principal.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LeaveResponse>> getAll() {
        return ResponseEntity.ok(leaveService.getAll());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeaveResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateRequest req) {
        return ResponseEntity.ok(leaveService.updateStatus(principal.getUsername(), id, req));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF')")
    public ResponseEntity<LeaveResponse> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(leaveService.cancel(principal.getUsername(), id));
    }
}
