package com.hms.backend.repository;

import com.hms.backend.entity.Appointment;
import com.hms.backend.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_IdOrderByAppointmentDateDescAppointmentTimeDesc(Long patientId);

    List<Appointment> findByDoctor_IdOrderByAppointmentDateDescAppointmentTimeDesc(Long doctorId);

    List<Appointment> findByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);

    List<Appointment> findByDoctor_IdAndAppointmentDateAndStatusIn(
            Long doctorId, LocalDate date, List<AppointmentStatus> statuses);

    Optional<Appointment> findByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
            Long doctorId, LocalDate date, LocalTime time, List<AppointmentStatus> statuses);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByAppointmentDate(LocalDate date);

    long countByAppointmentDate(LocalDate date);

    long countByStatus(AppointmentStatus status);
}
