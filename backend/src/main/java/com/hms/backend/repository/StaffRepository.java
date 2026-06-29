package com.hms.backend.repository;

import com.hms.backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByUser_Id(Long userId);
    Optional<Staff> findByUser_Email(String email);
    boolean existsByEmployeeCode(String employeeCode);
}
