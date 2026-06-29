package com.hms.backend.service;

import com.hms.backend.dto.appointment.AppointmentRequest;
import com.hms.backend.dto.appointment.AppointmentResponse;
import com.hms.backend.dto.appointment.AppointmentStatusUpdateRequest;
import com.hms.backend.dto.appointment.TimeSlotResponse;
import com.hms.backend.entity.Appointment;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Patient;
import com.hms.backend.enums.AppointmentStatus;
import com.hms.backend.enums.Role;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ConflictException;
import com.hms.backend.notification.NotificationService;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Core appointment-scheduling logic: slot generation from a doctor's working
 * hours, conflict-free booking, and role-aware status transitions.
 */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    private static final List<AppointmentStatus> ACTIVE_STATUSES =
            List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    // ---------------------------------------------------------------
    // Booking
    // ---------------------------------------------------------------

    @Transactional
    public AppointmentResponse bookAppointment(String patientEmail, AppointmentRequest req) {
        Patient patient = patientRepository.findByUser_Email(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.isApproved()) {
            throw new BadRequestException("This doctor is not yet available for bookings");
        }

        validateSlotIsBookable(doctor, req.getDate(), req.getTime());

        boolean alreadyTaken = appointmentRepository
                .findByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        doctor.getId(), req.getDate(), req.getTime(), ACTIVE_STATUSES)
                .isPresent();
        if (alreadyTaken) {
            throw new ConflictException("This time slot has just been booked. Please choose another time.");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(req.getDate())
                .appointmentTime(req.getTime())
                .status(AppointmentStatus.PENDING)
                .reason(req.getReason())
                .build();

        try {
            appointment = appointmentRepository.save(appointment);
        } catch (DataIntegrityViolationException ex) {
            // Safety net for a race between the check above and the insert
            // (covered by the DB unique constraint on doctor+date+time).
            throw new ConflictException("This time slot has just been booked. Please choose another time.");
        }

        String formattedDateTime = req.getDate() + " " + req.getTime();
        notificationService.sendAppointmentRequested(
                patient.getUser().getEmail(),
                patient.getUser().getFullName(),
                doctor.getUser().getFullName(),
                formattedDateTime
        );
        notificationService.sendAppointmentRequested(
                doctor.getUser().getEmail(),
                doctor.getUser().getFullName(),
                patient.getUser().getFullName(),
                formattedDateTime
        );

        return mapToResponse(appointment);
    }

    private void validateSlotIsBookable(Doctor doctor, LocalDate date, LocalTime time) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || (date.isEqual(today) && time.isBefore(LocalTime.now()))) {
            throw new BadRequestException("You cannot book an appointment in the past");
        }

        if (!workingDaysOf(doctor).contains(dayCode(date))) {
            throw new BadRequestException("The doctor does not see patients on this day");
        }

        if (!generateSlotTimes(doctor).contains(time)) {
            throw new BadRequestException("Please select a valid appointment time slot");
        }
    }

    private List<LocalTime> generateSlotTimes(Doctor doctor) {
        List<LocalTime> slots = new ArrayList<>();
        LocalTime cursor = doctor.getWorkStartTime();
        int duration = doctor.getSlotDurationMinutes();
        while (!cursor.plusMinutes(duration).isAfter(doctor.getWorkEndTime())) {
            slots.add(cursor);
            cursor = cursor.plusMinutes(duration);
        }
        return slots;
    }

    private Set<String> workingDaysOf(Doctor doctor) {
        return Arrays.stream(doctor.getWorkingDays().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private String dayCode(LocalDate date) {
        return date.getDayOfWeek().name().substring(0, 3);
    }

    // ---------------------------------------------------------------
    // Available slots (drives the patient-facing booking calendar)
    // ---------------------------------------------------------------

    public List<TimeSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Please choose today or a future date");
        }

        if (!workingDaysOf(doctor).contains(dayCode(date))) {
            return List.of();
        }

        List<LocalTime> allSlots = generateSlotTimes(doctor);

        Set<LocalTime> bookedTimes = appointmentRepository
                .findByDoctor_IdAndAppointmentDateAndStatusIn(doctorId, date, ACTIVE_STATUSES)
                .stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toSet());

        boolean isToday = date.isEqual(LocalDate.now());
        LocalTime now = LocalTime.now();

        List<TimeSlotResponse> result = new ArrayList<>();
        for (LocalTime slot : allSlots) {
            boolean available = !bookedTimes.contains(slot) && !(isToday && slot.isBefore(now));
            result.add(TimeSlotResponse.builder().time(slot).available(available).build());
        }
        return result;
    }

    // ---------------------------------------------------------------
    // Listing
    // ---------------------------------------------------------------

    public List<AppointmentResponse> getMyAppointments(String patientEmail, AppointmentStatus statusFilter) {
        Patient patient = patientRepository.findByUser_Email(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        List<Appointment> appointments =
                appointmentRepository.findByPatient_IdOrderByAppointmentDateDescAppointmentTimeDesc(patient.getId());

        return filterAndMap(appointments, statusFilter, null);
    }

    public List<AppointmentResponse> getDoctorAppointments(String doctorEmail, AppointmentStatus statusFilter, LocalDate dateFilter) {
        Doctor doctor = doctorRepository.findByUser_Email(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        List<Appointment> appointments =
                appointmentRepository.findByDoctor_IdOrderByAppointmentDateDescAppointmentTimeDesc(doctor.getId());

        return filterAndMap(appointments, statusFilter, dateFilter);
    }

    public List<AppointmentResponse> getAllAppointments(AppointmentStatus statusFilter, LocalDate dateFilter) {
        return filterAndMap(appointmentRepository.findAll(), statusFilter, dateFilter);
    }

    private List<AppointmentResponse> filterAndMap(List<Appointment> appointments, AppointmentStatus statusFilter, LocalDate dateFilter) {
        return appointments.stream()
                .filter(a -> statusFilter == null || a.getStatus() == statusFilter)
                .filter(a -> dateFilter == null || a.getAppointmentDate().isEqual(dateFilter))
                .sorted((a, b) -> {
                    int cmp = b.getAppointmentDate().compareTo(a.getAppointmentDate());
                    if (cmp != 0) return cmp;
                    return b.getAppointmentTime().compareTo(a.getAppointmentTime());
                })
                .map(this::mapToResponse)
                .toList();
    }

    // ---------------------------------------------------------------
    // Status transitions
    // ---------------------------------------------------------------

    @Transactional
    public AppointmentResponse updateStatus(String requesterEmail, Role requesterRole, Long appointmentId,
                                             AppointmentStatusUpdateRequest req) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentStatus newStatus = req.getStatus();
        boolean isTerminal = appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.REJECTED
                || appointment.getStatus() == AppointmentStatus.COMPLETED;

        switch (requesterRole) {
            case PATIENT -> {
                if (!appointment.getPatient().getUser().getEmail().equalsIgnoreCase(requesterEmail)) {
                    throw new BadRequestException("You can only manage your own appointments");
                }
                if (newStatus != AppointmentStatus.CANCELLED) {
                    throw new BadRequestException("Patients can only cancel an appointment");
                }
                if (isTerminal) {
                    throw new BadRequestException(
                            "This appointment is already " + appointment.getStatus() + " and cannot be changed");
                }
            }
            case DOCTOR -> {
                if (!appointment.getDoctor().getUser().getEmail().equalsIgnoreCase(requesterEmail)) {
                    throw new BadRequestException("You can only manage your own appointments");
                }
                if (isTerminal) {
                    throw new BadRequestException(
                            "This appointment is already " + appointment.getStatus() + " and cannot be changed");
                }
            }
            case ADMIN -> {
                // admins may override any transition
            }
        }

        appointment.setStatus(newStatus);
        if (req.getDoctorNotes() != null && (requesterRole == Role.DOCTOR || requesterRole == Role.ADMIN)) {
            appointment.setDoctorNotes(req.getDoctorNotes());
        }

        Appointment saved = appointmentRepository.save(appointment);

        String formattedDateTime = saved.getAppointmentDate() + " " + saved.getAppointmentTime();
        String patientEmail = saved.getPatient().getUser().getEmail();
        String patientName = saved.getPatient().getUser().getFullName();
        String doctorName = saved.getDoctor().getUser().getFullName();

        switch (newStatus) {
            case CONFIRMED -> notificationService.sendAppointmentApproved(patientEmail, patientName, doctorName, formattedDateTime);
            case REJECTED -> notificationService.sendAppointmentRejected(patientEmail, patientName, doctorName, formattedDateTime, req.getDoctorNotes());
            case CANCELLED -> notificationService.sendAppointmentCancelled(patientEmail, patientName, doctorName, formattedDateTime);
        }

        return mapToResponse(saved);
    }

    // ---------------------------------------------------------------
    // Mapping
    // ---------------------------------------------------------------

    public AppointmentResponse mapToResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .doctorSpecialization(a.getDoctor().getSpecialization())
                .departmentName(a.getDoctor().getDepartment().getName())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getUser().getFullName())
                .patientPhone(a.getPatient().getUser().getPhone())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .reason(a.getReason())
                .doctorNotes(a.getDoctorNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
