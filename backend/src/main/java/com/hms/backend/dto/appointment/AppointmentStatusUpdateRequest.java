package com.hms.backend.dto.appointment;

import com.hms.backend.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    /** Optional notes from the doctor, e.g. when marking COMPLETED */
    private String doctorNotes;
}
