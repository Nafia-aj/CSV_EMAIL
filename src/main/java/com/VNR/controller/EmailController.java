package com.VNR.controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
public class EmailController {

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final JavaMailSender javaMailSender;

    public EmailController(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @PostMapping("/api/send-email")
    public void sendEmail(@RequestParam String to,
                          @RequestParam String subject,
                          @RequestParam String content,
                          @RequestParam(required = false) MultipartFile attachment,
                          @RequestParam(required = false) MultipartFile csvFile) {

        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Content: " + content);

        if (attachment != null) {
            System.out.println("Attachment Name: " + attachment.getOriginalFilename());
          
        }

        if (csvFile != null) {
            System.out.println("CSV File Name: " + csvFile.getOriginalFilename());
          
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom(fromEmail);

        javaMailSender.send(message);
    }
}