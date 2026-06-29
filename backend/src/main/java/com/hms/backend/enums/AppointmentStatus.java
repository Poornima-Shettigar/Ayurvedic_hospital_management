package com.hms.backend.enums;

public enum AppointmentStatus {
    PENDING,    // created by patient, awaiting doctor confirmation
    CONFIRMED,  // accepted by doctor
    REJECTED,   // declined by doctor
    CANCELLED,  // cancelled by patient (or admin)
    COMPLETED   // consultation finished
}
