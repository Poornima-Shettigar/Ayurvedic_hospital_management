package com.hms.backend.config;

import com.hms.backend.entity.Department;
import com.hms.backend.entity.User;
import com.hms.backend.enums.Role;
import com.hms.backend.repository.DepartmentRepository;
import com.hms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Runs once on startup: creates the default admin account and a starter
 * list of departments so the app is usable immediately after first boot.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDepartments();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = User.builder()
                .fullName("System Administrator")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("=================================================================");
        log.info(" Seeded default admin account");
        log.info("   email:    {}", adminEmail);
        log.info("   password: {}", adminPassword);
        log.info("=================================================================");
    }

    private void seedDepartments() {
        List<String> defaults = List.of(
                "General Medicine", "Cardiology", "Neurology", "Orthopedics",
                "Pediatrics", "Dermatology", "ENT", "Dental Care",
                "Gynecology", "Psychiatry"
        );
        for (String name : defaults) {
            if (!departmentRepository.existsByNameIgnoreCase(name)) {
                departmentRepository.save(Department.builder()
                        .name(name)
                        .description("Department of " + name)
                        .build());
            }
        }
    }
}
