package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id") // Veritabanındaki user_id ile eşleşir
    private Long userId;

    @Column(name = "message") // Veritabanındaki message (varchar) ile eşleşir
    private String message;

    @Column(name = "okundu", nullable = false) // is_read yazan yeri logdaki gibi "okundu" yap
    private boolean okundu = false;
    
    @Column(name = "target_url")
    private String targetUrl;

    @Column(name = "created_at") // Veritabanındaki created_at ile eşleşir
    private LocalDateTime createdAt;

    @Column(name = "load_id") // Veritabanındaki load_id ile eşleşir
    private Long loadId;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}