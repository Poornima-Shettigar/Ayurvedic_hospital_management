package com.hms.backend.notification;

import com.hms.backend.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final EmailService emailService;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.mail.admin-email}")
    private String adminEmail;

    public NotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    // ---------------------------
    // Appointment notifications
    // ---------------------------

    public void sendAppointmentRequested(String patientEmail,
                                           String patientName,
                                           String doctorName,
                                           String appointmentDateTime) {
        String subject = "Appointment Request Received";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("We received your appointment request with Dr. ").append(doctorName).append(".\n")
                .append("Requested date/time: ").append(appointmentDateTime).append("\n\n")
                .append("Status: Pending approval.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    public void sendAppointmentApproved(String patientEmail,
                                          String patientName,
                                          String doctorName,
                                          String appointmentDateTime) {
        String subject = "Appointment Approved";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("Your appointment with Dr. ").append(doctorName).append(" has been approved.\n")
                .append("Date/time: ").append(appointmentDateTime).append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    public void sendAppointmentRejected(String patientEmail,
                                          String patientName,
                                          String doctorName,
                                          String appointmentDateTime,
                                          String reason) {
        String subject = "Appointment Rejected";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("Your appointment request with Dr. ").append(doctorName).append(" was rejected.\n")
                .append("Requested date/time: ").append(appointmentDateTime).append("\n")
                .append("Reason: ").append(reason == null || reason.isBlank() ? "Not specified" : reason).append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    public void sendAppointmentCancelled(String patientEmail,
                                          String patientName,
                                          String doctorName,
                                          String appointmentDateTime) {
        String subject = "Appointment Cancelled";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("Your appointment with Dr. ").append(doctorName).append(" has been cancelled.\n")
                .append("Date/time: ").append(appointmentDateTime).append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    public void sendAppointmentReminder(String patientEmail,
                                         String patientName,
                                         String doctorName,
                                         String appointmentDateTime) {
        String subject = "Appointment Reminder";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("This is a reminder for your appointment with Dr. ").append(doctorName).append(".\n")
                .append("Date/time: ").append(appointmentDateTime).append("\n\n")
                .append("Please arrive 10 minutes early.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    // ---------------------------
    // Doctor registration notifications
    // ---------------------------

    public void sendDoctorRegistrationRequestedToAdmin(String doctorEmail,
                                                        String doctorName,
                                                        String specialization) {
        String subject = "New Doctor Registration Request";
        String body = new StringBuilder()
                .append("Admin,\n\n")
                .append("A new doctor registration request has been submitted.\n")
                .append("Doctor: ").append(doctorName).append("\n")
                .append("Email: ").append(doctorEmail).append("\n")
                .append("Specialization: ")
                .append(specialization == null || specialization.isBlank() ? "Not specified" : specialization)
                .append("\n\n")
                .append("Please review and take action.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(adminEmail, subject, body);
    }

    public void sendDoctorRegistrationApproved(String doctorEmail,
                                               String doctorName) {
        String subject = "Doctor Registration Approved";
        String body = new StringBuilder()
                .append("Hi ").append(doctorName).append(",\n\n")
                .append("Your doctor registration request has been approved.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(doctorEmail, subject, body);
    }

    public void sendDoctorRegistrationRejected(String doctorEmail,
                                               String doctorName,
                                               String reason) {
        String subject = "Doctor Registration Rejected";
        String body = new StringBuilder()
                .append("Hi ").append(doctorName).append(",\n\n")
                .append("Your doctor registration request has been rejected.\n")
                .append("Reason: ").append(reason == null || reason.isBlank() ? "Not specified" : reason).append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(doctorEmail, subject, body);
    }

    // ---------------------------
    // Billing notifications
    // ---------------------------

    public void sendInvoiceGenerated(String patientEmail,
                                      String patientName,
                                      String invoiceNumber,
                                      double amount) {
        String subject = "Invoice Generated";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("Your invoice has been generated.\n")
                .append("Invoice Number: ").append(invoiceNumber).append("\n")
                .append("Amount: ").append(amount).append("\n\n")
                .append("Please make your payment at your earliest convenience.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    public void sendPaymentSuccessful(String patientEmail,
                                        String patientName,
                                        String invoiceNumber,
                                        double amount) {
        String subject = "Payment Successful";
        String body = new StringBuilder()
                .append("Hi ").append(patientName).append(",\n\n")
                .append("We confirm that your payment was successful.\n")
                .append("Invoice Number: ").append(invoiceNumber).append("\n")
                .append("Amount: ").append(amount).append("\n\n")
                .append("Thank you,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(patientEmail, subject, body);
    }

    // ---------------------------
    // Authentication notifications
    // ---------------------------

    public void sendWelcomeEmail(String userEmail, String userName) {
        String subject = "Welcome to Illness & Wellness Hospital";
        String body = new StringBuilder()
                .append("Hi ").append(userName).append(",\n\n")
                .append("Welcome! Your account has been created successfully.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(userEmail, subject, body);
    }

    public void sendPasswordResetEmail(String userEmail, String userName, String resetToken) {
        String subject = "Password Reset Request";
        String body = new StringBuilder()
                .append("Hi ").append(userName).append(",\n\n")
                .append("We received a request to reset your password.\n")
                .append("Use this reset token to set a new password:\n")
                .append(resetToken).append("\n\n")
                .append("If you didn’t request this, you can ignore this email.\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(userEmail, subject, body);
    }

    // ---------------------------
    // Leave notifications
    // ---------------------------

    public void sendLeaveNotification(String recipientEmail,
                                       String recipientName,
                                       String leaveStatus,
                                       String fromDate,
                                       String toDate) {
        String subject = "Leave Update: " + (leaveStatus == null || leaveStatus.isBlank() ? "Status Updated" : leaveStatus);

        String body = new StringBuilder()
                .append("Hi ").append(recipientName).append(",\n\n")
                .append("Your leave request status has been updated.\n")
                .append("Status: ").append(leaveStatus == null || leaveStatus.isBlank() ? "Updated" : leaveStatus).append("\n")
                .append("From: ").append(fromDate == null ? "N/A" : fromDate).append("\n")
                .append("To: ").append(toDate == null ? "N/A" : toDate).append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(recipientEmail, subject, body);
    }

    // ---------------------------
    // Pharmacy notifications
    // ---------------------------

    public void sendPharmacyNotification(String recipientEmail,
                                          String recipientName,
                                          String notificationTitle,
                                          String message) {
        String subject = notificationTitle == null || notificationTitle.isBlank()
                ? "Pharmacy Notification"
                : notificationTitle;

        String body = new StringBuilder()
                .append("Hi ").append(recipientName).append(",\n\n")
                .append(message == null || message.isBlank() ? "You have a new pharmacy update." : message)
                .append("\n\n")
                .append("Regards,\nIllness & Wellness Hospital")
                .toString();

        emailService.sendMail(recipientEmail, subject, body);
    }

    // Kept to avoid unused-field warnings if you later extend EmailService to support "from".
    @SuppressWarnings("unused")
    private String mailFromValue() {
        return mailFrom;
    }
}
