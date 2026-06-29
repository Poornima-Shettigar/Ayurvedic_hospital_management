package com.hms.backend.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
     @Value("${app.mail.from}")
    private String fromEmail;

    public void sendMail(String to,
                          String subject,
                          String body) {

        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Email 'to' must not be null/blank");
        }
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Email 'subject' must not be null/blank");
        }
        if (body == null) {
            body = "";
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);  
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Fail loudly so the caller + backend logs show the real SMTP/auth error.
            throw new RuntimeException("Failed to send email to '" + to + "' with subject '" + subject + "'", e);
        }
    }
}
