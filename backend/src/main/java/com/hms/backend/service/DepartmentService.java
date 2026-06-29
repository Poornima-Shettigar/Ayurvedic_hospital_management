package com.hms.backend.service;

import com.hms.backend.dto.department.DepartmentRequest;
import com.hms.backend.dto.department.DepartmentResponse;
import com.hms.backend.entity.Department;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DepartmentResponse create(DepartmentRequest req) {
        if (departmentRepository.existsByNameIgnoreCase(req.getName())) {
            throw new BadRequestException("A department with this name already exists");
        }
        Department department = Department.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return mapToResponse(departmentRepository.save(department));
    }

    public DepartmentResponse update(Long id, DepartmentRequest req) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        department.setName(req.getName());
        department.setDescription(req.getDescription());
        return mapToResponse(departmentRepository.save(department));
    }

    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        long doctorCount = doctorRepository.countByDepartment_Id(id);
        if (doctorCount > 0) {
            throw new BadRequestException("Cannot delete a department that still has doctors assigned to it");
        }
        departmentRepository.delete(department);
    }

    private DepartmentResponse mapToResponse(Department department) {
        long doctorCount = doctorRepository.countByDepartment_Id(department.getId());
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .doctorCount(doctorCount)
                .build();
    }
}
