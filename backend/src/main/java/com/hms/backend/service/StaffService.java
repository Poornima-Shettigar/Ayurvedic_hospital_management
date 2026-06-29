package com.hms.backend.service;

import com.hms.backend.dto.staff.StaffCreateRequest;
import com.hms.backend.dto.staff.StaffResponse;
import com.hms.backend.dto.staff.StaffUpdateRequest;
import com.hms.backend.entity.Department;
import com.hms.backend.entity.Staff;
import com.hms.backend.entity.User;
import com.hms.backend.enums.Role;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.StaffRepository;
import com.hms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Staff are onboarded by an admin (not self-registered) — this mirrors how a
 * real hospital's HR process works, unlike patients who sign themselves up.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponse create(StaffCreateRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        Department department = null;
        if (req.getDepartmentId() != null) {
            department = departmentRepository.findById(req.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.STAFF)
                .active(true)
                .build();
        user = userRepository.save(user);

        Staff staff = Staff.builder()
                .user(user)
                .employeeCode(generateEmployeeCode())
                .designation(req.getDesignation())
                .department(department)
                .dateOfJoining(req.getDateOfJoining())
                .address(req.getAddress())
                .build();

        return mapToResponse(staffRepository.save(staff));
    }

    private String generateEmployeeCode() {
        String code;
        do {
            code = "EMP" + String.format("%05d", (int) (Math.random() * 100000));
        } while (staffRepository.existsByEmployeeCode(code));
        return code;
    }

    public List<StaffResponse> getAll() {
        return staffRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public StaffResponse getById(Long id) {
        return mapToResponse(staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found")));
    }

    public StaffResponse getMyProfile(String email) {
        return mapToResponse(staffRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found")));
    }

    @Transactional
    public StaffResponse update(Long id, StaffUpdateRequest req) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        if (req.getDesignation() != null) staff.setDesignation(req.getDesignation());
        if (req.getDateOfJoining() != null) staff.setDateOfJoining(req.getDateOfJoining());
        if (req.getAddress() != null) staff.setAddress(req.getAddress());
        if (req.getPhone() != null) staff.getUser().setPhone(req.getPhone());
        if (req.getDepartmentId() != null) {
            Department department = departmentRepository.findById(req.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            staff.setDepartment(department);
        }

        return mapToResponse(staffRepository.save(staff));
    }

    @Transactional
    public void delete(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));
        User user = staff.getUser();
        staffRepository.delete(staff);
        userRepository.delete(user);
    }

    private StaffResponse mapToResponse(Staff staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .userId(staff.getUser().getId())
                .employeeCode(staff.getEmployeeCode())
                .fullName(staff.getUser().getFullName())
                .email(staff.getUser().getEmail())
                .phone(staff.getUser().getPhone())
                .designation(staff.getDesignation())
                .departmentId(staff.getDepartment() != null ? staff.getDepartment().getId() : null)
                .departmentName(staff.getDepartment() != null ? staff.getDepartment().getName() : null)
                .dateOfJoining(staff.getDateOfJoining())
                .address(staff.getAddress())
                .build();
    }
}
