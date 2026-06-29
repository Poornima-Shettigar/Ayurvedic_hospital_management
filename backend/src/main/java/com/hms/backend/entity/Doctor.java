package com.hms.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    private String specialization;

    private String qualification;

    private int experienceYears;

    private BigDecimal consultationFee;

    @Column(length = 1000)
    private String bio;

    @Builder.Default
    @Column(nullable = false)
    private LocalTime workStartTime = LocalTime.of(9, 0);

    @Builder.Default
    @Column(nullable = false)
    private LocalTime workEndTime = LocalTime.of(17, 0);

    @Builder.Default
    @Column(nullable = false)
    private int slotDurationMinutes = 30;

    /** Comma separated 3-letter day codes, e.g. "MON,TUE,WED,THU,FRI,SAT" */
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String workingDays = "MON,TUE,WED,THU,FRI,SAT";

    /** Doctors must be approved by an admin before patients can book them */
    @Builder.Default
    @Column(nullable = false)
    private boolean approved = false;

    @Builder.Default
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments = new ArrayList<>();
}
