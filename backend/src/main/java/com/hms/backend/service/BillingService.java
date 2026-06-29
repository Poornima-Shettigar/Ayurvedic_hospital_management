package com.hms.backend.service;

import com.hms.backend.dto.billing.InvoiceCreateRequest;
import com.hms.backend.dto.billing.InvoiceItemRequest;
import com.hms.backend.dto.billing.InvoiceItemResponse;
import com.hms.backend.dto.billing.InvoiceResponse;
import com.hms.backend.dto.billing.PaymentRequest;
import com.hms.backend.entity.Appointment;
import com.hms.backend.entity.Invoice;
import com.hms.backend.entity.InvoiceItem;
import com.hms.backend.entity.Patient;
import com.hms.backend.entity.User;
import com.hms.backend.enums.InvoiceStatus;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.notification.NotificationService;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.InvoiceRepository;
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
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public InvoiceResponse create(String createdByEmail, InvoiceCreateRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Appointment appointment = null;
        if (req.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        }

        User createdBy = userRepository.findByEmail(createdByEmail).orElse(null);

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .appointment(appointment)
                .createdBy(createdBy)
                .notes(req.getNotes())
                .status(InvoiceStatus.UNPAID)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (InvoiceItemRequest itemReq : req.getItems()) {
            BigDecimal amount = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .itemType(itemReq.getItemType())
                    .description(itemReq.getDescription())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .amount(amount)
                    .build();
            invoice.getItems().add(item);
            total = total.add(amount);
        }
        invoice.setTotalAmount(total);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        notificationService.sendInvoiceGenerated(
                patient.getUser().getEmail(),
                patient.getUser().getFullName(),
                "INV-" + savedInvoice.getId(),
                savedInvoice.getTotalAmount().doubleValue()
        );

        return mapToResponse(savedInvoice);
    }

    public List<InvoiceResponse> getAll() {
        return invoiceRepository.findAllByOrderByIssueDateDescIdDesc().stream()
                .map(this::mapToResponse).toList();
    }

    public List<InvoiceResponse> getMine(String patientEmail) {
        Patient patient = patientRepository.findByUser_Email(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return invoiceRepository.findByPatient_IdOrderByIssueDateDescIdDesc(patient.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    public InvoiceResponse getById(Long id) {
        return mapToResponse(findInvoice(id));
    }

    @Transactional
    public InvoiceResponse recordPayment(Long id, PaymentRequest req) {
        Invoice invoice = findInvoice(id);

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("This invoice has been cancelled");
        }

        BigDecimal newPaid = invoice.getPaidAmount().add(req.getAmount());
        if (newPaid.compareTo(invoice.getTotalAmount()) > 0) {
            throw new BadRequestException("Payment exceeds the remaining balance");
        }

        invoice.setPaidAmount(newPaid);
        invoice.setPaymentMethod(req.getPaymentMethod());
        invoice.setStatus(newPaid.compareTo(invoice.getTotalAmount()) == 0
                ? InvoiceStatus.PAID
                : InvoiceStatus.PARTIALLY_PAID);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        notificationService.sendPaymentSuccessful(
                invoice.getPatient().getUser().getEmail(),
                invoice.getPatient().getUser().getFullName(),
                "INV-" + savedInvoice.getId(),
                req.getAmount().doubleValue()
        );

        return mapToResponse(savedInvoice);
    }

    @Transactional
    public InvoiceResponse cancel(Long id) {
        Invoice invoice = findInvoice(id);
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    private Invoice findInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .patientId(invoice.getPatient().getId())
                .patientName(invoice.getPatient().getUser().getFullName())
                .appointmentId(invoice.getAppointment() != null ? invoice.getAppointment().getId() : null)
                .status(invoice.getStatus())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .paymentMethod(invoice.getPaymentMethod())
                .notes(invoice.getNotes())
                .issueDate(invoice.getIssueDate())
                .createdByName(invoice.getCreatedBy() != null ? invoice.getCreatedBy().getFullName() : null)
                .createdAt(invoice.getCreatedAt())
                .items(invoice.getItems().stream().map(this::mapItem).toList())
                .build();
    }

    private InvoiceItemResponse mapItem(InvoiceItem item) {
        return InvoiceItemResponse.builder()
                .id(item.getId())
                .itemType(item.getItemType())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .amount(item.getAmount())
                .build();
    }
}
