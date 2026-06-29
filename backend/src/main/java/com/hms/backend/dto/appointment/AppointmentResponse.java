package com.hms.backend.dto.appointment;

import com.hms.backend.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;

    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String departmentName;

    private Long patientId;
    private String patientName;
    private String patientPhone;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String reason;
    private String doctorNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
