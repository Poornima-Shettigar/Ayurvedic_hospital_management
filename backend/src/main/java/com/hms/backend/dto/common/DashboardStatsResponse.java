package com.hms.backend.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long pendingDoctorApprovals;
    private long totalDepartments;
    private long appointmentsToday;
    private long pendingAppointments;
    private long completedAppointments;
    private long totalStaff;
    private long totalMedicines;
    private long lowStockMedicines;
    private long unpaidInvoices;
    private long pendingLeaveRequests;
}
