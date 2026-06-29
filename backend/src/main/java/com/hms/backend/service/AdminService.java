package com.hms.backend.service;

import com.hms.backend.dto.common.DashboardStatsResponse;
import com.hms.backend.enums.AppointmentStatus;
import com.hms.backend.enums.InvoiceStatus;
import com.hms.backend.enums.LeaveStatus;
import com.hms.backend.repository.AppointmentRepository;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.InvoiceRepository;
import com.hms.backend.repository.LeaveRequestRepository;
import com.hms.backend.repository.MedicineRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final StaffRepository staffRepository;
    private final MedicineRepository medicineRepository;
    private final InvoiceRepository invoiceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public DashboardStatsResponse getDashboardStats() {
        return DashboardStatsResponse.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorRepository.count())
                .pendingDoctorApprovals(doctorRepository.findByApprovedFalse().size())
                .totalDepartments(departmentRepository.count())
                .appointmentsToday(appointmentRepository.countByAppointmentDate(LocalDate.now()))
                .pendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING))
                .completedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED))
                .totalStaff(staffRepository.count())
                .totalMedicines(medicineRepository.count())
                .lowStockMedicines(medicineRepository.countLowStock())
                .unpaidInvoices(invoiceRepository.countByStatus(InvoiceStatus.UNPAID))
                .pendingLeaveRequests(leaveRequestRepository.countByStatus(LeaveStatus.PENDING))
                .build();
    }
}
