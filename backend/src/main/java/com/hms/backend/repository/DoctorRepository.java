package com.hms.backend.repository;

import com.hms.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser_Id(Long userId);
    Optional<Doctor> findByUser_Email(String email);
    List<Doctor> findByApprovedTrue();
    List<Doctor> findByApprovedFalse();
    List<Doctor> findByDepartment_IdAndApprovedTrue(Long departmentId);
    long countByDepartment_Id(Long departmentId);
}
