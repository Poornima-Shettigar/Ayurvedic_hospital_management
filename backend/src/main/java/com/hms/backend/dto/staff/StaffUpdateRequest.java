package com.hms.backend.dto.staff;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StaffUpdateRequest {
    private String designation;
    private Long departmentId;
    private LocalDate dateOfJoining;
    private String address;
    private String phone;
}
