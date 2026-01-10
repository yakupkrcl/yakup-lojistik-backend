package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "rating")
@EqualsAndHashCode(exclude = {"puanlayanKullanici", "puanlananKullanici", "yuk"})
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @Column(nullable = false)
    private Double puan;

    @Column(length = 500)
    private String yorum;

    @ManyToOne 
    @JoinColumn(name = "puanlayan_kullanici_id", nullable = false)
    @JsonIgnoreProperties({"ratings", "documents", "loads", "offers", "notifications", "sifreHash"})
    private User puanlayanKullanici;
    
    @ManyToOne 
    @JoinColumn(name = "puanlanan_kullanici_id", nullable = false)
    @JsonIgnoreProperties({"ratings", "documents", "loads", "offers", "notifications", "sifreHash"})
    private User puanlananKullanici;
    
    @ManyToOne 
    @JoinColumn(name = "yuk_id", nullable = false)
    private Load yuk; 

    @CreationTimestamp
    private LocalDateTime olusturulmaTarihi;
}
