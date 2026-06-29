package com.hms.backend.controller;

import com.hms.backend.dto.billing.InvoiceCreateRequest;
import com.hms.backend.dto.billing.InvoiceResponse;
import com.hms.backend.dto.billing.PaymentRequest;
import com.hms.backend.security.UserPrincipal;
import com.hms.backend.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<InvoiceResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InvoiceCreateRequest req) {
        return ResponseEntity.ok(billingService.create(principal.getUsername(), req));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<InvoiceResponse>> getAll() {
        return ResponseEntity.ok(billingService.getAll());
    }

    /** Patients see their own full invoice history (line items included) here —
     *  there is no separate /invoices/{id} for patients, which keeps one
     *  patient from being able to probe another patient's invoice by id. */
    @GetMapping("/invoices/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> getMine(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(billingService.getMine(principal.getUsername()));
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getById(id));
    }

    @PutMapping("/invoices/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<InvoiceResponse> recordPayment(
            @PathVariable Long id, @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(billingService.recordPayment(id, req));
    }

    @PutMapping("/invoices/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<InvoiceResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.cancel(id));
    }
}
