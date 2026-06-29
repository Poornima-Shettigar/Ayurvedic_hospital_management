package com.hms.backend.dto.staff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class StaffResponse {
    private Long id;
    private Long userId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private Long departmentId;
    private String departmentName;
    private LocalDate dateOfJoining;
    private String address;
}
