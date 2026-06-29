package com.hms.backend.dto.doctor;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DoctorAvailabilityRequest {
    /** e.g. "09:00" */
    private String workStartTime;
    /** e.g. "17:00" */
    private String workEndTime;
    private Integer slotDurationMinutes;
    /** comma separated, e.g. "MON,TUE,WED,THU,FRI" */
    private String workingDays;
    private BigDecimal consultationFee;
    private String bio;
}
