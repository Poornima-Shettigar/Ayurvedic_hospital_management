package com.hms.backend.dto.leave;

import com.hms.backend.enums.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LeaveStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private LeaveStatus status;

    private String reviewNotes;
}
