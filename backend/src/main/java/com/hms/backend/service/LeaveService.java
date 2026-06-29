package com.hms.backend.service;

import com.hms.backend.dto.leave.LeaveRequestCreateRequest;
import com.hms.backend.dto.leave.LeaveResponse;
import com.hms.backend.dto.leave.LeaveStatusUpdateRequest;
import com.hms.backend.entity.LeaveRequest;
import com.hms.backend.entity.User;
import com.hms.backend.enums.LeaveStatus;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.LeaveRequestRepository;
import com.hms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public LeaveResponse create(String requesterEmail, LeaveRequestCreateRequest req) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BadRequestException("End date must be on or after the start date");
        }

        LeaveRequest leave = LeaveRequest.builder()
                .requester(requester)
                .leaveType(req.getLeaveType())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        return mapToResponse(leaveRequestRepository.save(leave));
    }

    public List<LeaveResponse> getMine(String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return leaveRequestRepository.findByRequester_IdOrderByAppliedAtDesc(requester.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    public List<LeaveResponse> getAll() {
        return leaveRequestRepository.findAllByOrderByAppliedAtDesc().stream()
                .map(this::mapToResponse).toList();
    }

    @Transactional
    public LeaveResponse updateStatus(String reviewerEmail, Long id, LeaveStatusUpdateRequest req) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        User reviewer = userRepository.findByEmail(reviewerEmail).orElse(null);

        leave.setStatus(req.getStatus());
        leave.setReviewNotes(req.getReviewNotes());
        leave.setReviewedBy(reviewer);

        return mapToResponse(leaveRequestRepository.save(leave));
    }

    @Transactional
    public LeaveResponse cancel(String requesterEmail, Long id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!leave.getRequester().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new BadRequestException("You can only cancel your own leave request");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only a pending request can be cancelled");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        return mapToResponse(leaveRequestRepository.save(leave));
    }

    private LeaveResponse mapToResponse(LeaveRequest leave) {
        long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        return LeaveResponse.builder()
                .id(leave.getId())
                .requesterId(leave.getRequester().getId())
                .requesterName(leave.getRequester().getFullName())
                .requesterRole(leave.getRequester().getRole())
                .leaveType(leave.getLeaveType())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .days(days)
                .reason(leave.getReason())
                .status(leave.getStatus())
                .reviewedByName(leave.getReviewedBy() != null ? leave.getReviewedBy().getFullName() : null)
                .reviewNotes(leave.getReviewNotes())
                .appliedAt(leave.getAppliedAt())
                .build();
    }
}
