package com.yakupProje.services;

import com.yakupProje.entity.Notification;
import com.yakupProje.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(Long userId, String message, Long loadId, String targetUrl) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setLoadId(loadId);
        notification.setTargetUrl(targetUrl);
        notification.setOkundu(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

}