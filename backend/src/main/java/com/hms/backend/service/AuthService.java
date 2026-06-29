package com.hms.backend.service;

import com.hms.backend.dto.auth.JwtResponse;
import com.hms.backend.dto.auth.LoginRequest;
import com.hms.backend.dto.auth.RegisterDoctorRequest;
import com.hms.backend.dto.auth.RegisterPatientRequest;
import com.hms.backend.entity.Department;
import com.hms.backend.entity.Doctor;
import com.hms.backend.entity.Patient;
import com.hms.backend.entity.User;
import com.hms.backend.enums.Role;
import com.hms.backend.exception.BadRequestException;
import com.hms.backend.exception.ResourceNotFoundException;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.notification.NotificationService;
import com.hms.backend.repository.DoctorRepository;
import com.hms.backend.repository.PatientRepository;
import com.hms.backend.repository.UserRepository;
import com.hms.backend.security.JwtUtil;
import com.hms.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    @Transactional
    public JwtResponse registerPatient(RegisterPatientRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.PATIENT)
                .active(true)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(user)
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .build();
        patientRepository.save(patient);

        notificationService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtUtil.generateToken(new UserPrincipal(user));

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(true)
                .build();
    }

    @Transactional
    public JwtResponse registerDoctor(RegisterDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        Department department = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(Role.DOCTOR)
                .active(true)
                .build();
        user = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(user)
                .department(department)
                .specialization(req.getSpecialization())
                .qualification(req.getQualification())
                .experienceYears(req.getExperienceYears())
                .approved(false)
                .build();
        doctorRepository.save(doctor);

        notificationService.sendDoctorRegistrationRequestedToAdmin(
                user.getEmail(), user.getFullName(), req.getSpecialization()
        );

        String token = jwtUtil.generateToken(new UserPrincipal(user));

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(false)
                .build();
    }

    public JwtResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Boolean approved = null;
        if (user.getRole() == Role.DOCTOR) {
            approved = doctorRepository.findByUser_Id(user.getId())
                    .map(Doctor::isApproved)
                    .orElse(false);
        }

        String token = jwtUtil.generateToken(new UserPrincipal(user));

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(approved)
                .build();
    }

    public JwtResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Boolean approved = null;
        if (user.getRole() == Role.DOCTOR) {
            approved = doctorRepository.findByUser_Id(user.getId())
                    .map(Doctor::isApproved)
                    .orElse(false);
        }

        return JwtResponse.builder()
                .token(null)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .approved(approved)
                .build();
    }
}
