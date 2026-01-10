package com.yakupProje.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "message")
@EqualsAndHashCode(exclude = {"gonderen", "alici", "yuk"})
public class Message {

	@Id

	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(length = 2000, nullable = false)
	private String mesajMetni;

	@Column(nullable = false)
    private Boolean okunduMu = false;
	
	@ManyToOne 
    @JoinColumn(name = "gonderen_id", nullable = false)
    private User gonderen; 

    @ManyToOne 
    @JoinColumn(name = "alici_id", nullable = false)
    private User alici; 
    
    @ManyToOne 
    @JoinColumn(name = "yuk_id", nullable = false)
    private Load yuk; 

    @CreationTimestamp
    private LocalDateTime olusturulmaTarihi;
}
