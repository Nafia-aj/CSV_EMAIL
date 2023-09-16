package com.VNR.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.InputStreamSource;

import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@RestController
public class EmailController {

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final JavaMailSender javaMailSender;

    public EmailController(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }
    
    @PostMapping("/api/send-email")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestParam String to,
                                            @RequestParam String subject,
                                            @RequestParam String content,
                                            @RequestParam(required = false) MultipartFile attachment,
                                            @RequestParam(required = false) MultipartFile csvFile) {

        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Content: " + content);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom(fromEmail);

            if (attachment != null && !attachment.isEmpty()) {
                helper.addAttachment(attachment.getOriginalFilename(), new InputStreamSource() {
                    @Override
                    public InputStream getInputStream() {
                        try {
                            return attachment.getInputStream();
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    }
                });
            }

            javaMailSender.send(message);

            System.out.println("Email sent successfully.");
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email sent successfully.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error sending email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
