package com.yakupProje.controller;

import com.yakupProje.entity.Notification;
import com.yakupProje.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/rest/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/my-notifications/{userId}")
    public List<Notification> getMyNotifications(@PathVariable Long userId) {
        // En yeni bildirimler en üstte gelsin
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/mark-as-read/{id}")
    public void markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setOkundu(true);
        notificationRepository.save(n);
    }
}