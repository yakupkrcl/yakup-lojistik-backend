package com.yakupProje.repository;

import com.yakupProje.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // userId ismi yukarıdaki Entity ile birebir aynı olmalı
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}