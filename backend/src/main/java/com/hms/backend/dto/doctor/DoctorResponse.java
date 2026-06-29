package com.hms.backend.dto.doctor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String specialization;
    private String qualification;
    private int experienceYears;
    private BigDecimal consultationFee;
    private String bio;
    private String workStartTime;
    private String workEndTime;
    private int slotDurationMinutes;
    private String workingDays;
    private boolean approved;
}
