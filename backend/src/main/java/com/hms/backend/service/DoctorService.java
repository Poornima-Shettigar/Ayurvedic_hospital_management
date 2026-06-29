package com.hms.backend.service;

import com.hms.backend.dto.doctor.DoctorAvailabilityRequest;
import com.hms.backend.dto.doctor.DoctorResponse;
import com.hms.backend.entity.Doctor;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public List<DoctorResponse> getApprovedDoctors(Long departmentId) {
        List<Doctor> doctors = (departmentId != null)
                ? doctorRepository.findByDepartment_IdAndApprovedTrue(departmentId)
                : doctorRepository.findByApprovedTrue();
        return doctors.stream().map(this::mapToResponse).toList();
    }

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public List<DoctorResponse> getPendingDoctors() {
        return doctorRepository.findByApprovedFalse().stream().map(this::mapToResponse).toList();
    }

    public DoctorResponse approveDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setApproved(true);
        return mapToResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse getById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return mapToResponse(doctor);
    }

    public DoctorResponse getMyProfile(String email) {
        Doctor doctor = doctorRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return mapToResponse(doctor);
    }

    public DoctorResponse updateAvailability(String email, DoctorAvailabilityRequest req) {
        Doctor doctor = doctorRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        if (req.getWorkStartTime() != null && req.getWorkEndTime() != null) {
            LocalTime start = LocalTime.parse(req.getWorkStartTime(), TIME_FMT);
            LocalTime end = LocalTime.parse(req.getWorkEndTime(), TIME_FMT);
            if (!start.isBefore(end)) {
                throw new BadRequestException("Work start time must be before end time");
            }
            doctor.setWorkStartTime(start);
            doctor.setWorkEndTime(end);
        }
        if (req.getSlotDurationMinutes() != null) {
            if (req.getSlotDurationMinutes() < 5 || req.getSlotDurationMinutes() > 180) {
                throw new BadRequestException("Slot duration must be between 5 and 180 minutes");
            }
            doctor.setSlotDurationMinutes(req.getSlotDurationMinutes());
        }
        if (req.getWorkingDays() != null && !req.getWorkingDays().isBlank()) {
            doctor.setWorkingDays(req.getWorkingDays().toUpperCase());
        }
        if (req.getConsultationFee() != null) {
            doctor.setConsultationFee(req.getConsultationFee());
        }
        if (req.getBio() != null) {
            doctor.setBio(req.getBio());
        }

        return mapToResponse(doctorRepository.save(doctor));
    }

    public DoctorResponse mapToResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .fullName(doctor.getUser().getFullName())
                .email(doctor.getUser().getEmail())
                .phone(doctor.getUser().getPhone())
                .departmentId(doctor.getDepartment().getId())
                .departmentName(doctor.getDepartment().getName())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .workStartTime(doctor.getWorkStartTime().format(TIME_FMT))
                .workEndTime(doctor.getWorkEndTime().format(TIME_FMT))
                .slotDurationMinutes(doctor.getSlotDurationMinutes())
                .workingDays(doctor.getWorkingDays())
                .approved(doctor.isApproved())
                .build();
    }
}
