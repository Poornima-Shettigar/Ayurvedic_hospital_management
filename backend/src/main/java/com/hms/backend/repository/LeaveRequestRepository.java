package com.hms.backend.repository;

import com.hms.backend.entity.LeaveRequest;
import com.hms.backend.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByRequester_IdOrderByAppliedAtDesc(Long requesterId);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    long countByStatus(LeaveStatus status);
}
