package com.hms.backend.dto.leave;

import com.hms.backend.enums.LeaveStatus;
import com.hms.backend.enums.LeaveType;
import com.hms.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class LeaveResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private Role requesterRole;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private long days;
    private String reason;
    private LeaveStatus status;
    private String reviewedByName;
    private String reviewNotes;
    private LocalDateTime appliedAt;
}
