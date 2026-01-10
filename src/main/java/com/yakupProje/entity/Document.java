package com.yakupProje.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yakupProje.enums.DocumentStatus;
import com.yakupProje.enums.DocumentType; 

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "document")
@EqualsAndHashCode(exclude = {"yuk", "yukleyenKullanici"})
public class Document {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String dosyaAdi;
	
	@Column(nullable = false)
	private String depolamaYolu;

	private String mimeTipi;
	
	@Enumerated(EnumType.STRING)
    private DocumentType belgeTipi;
	 private String redSebebi;
	
	// Document.java içine ekle
	@Enumerated(EnumType.STRING)
	private DocumentStatus status = DocumentStatus.BEKLEMEDE; // Varsayılan değer

	// Eğer @Data veya @Setter anatasyonu yoksa şunu da ekle:
	public void setStatus(DocumentStatus status) {
	    this.status = status;
	}
	
	@ManyToOne 
    @JoinColumn(name = "yuk_id") 
    private Load yuk; 

	@ManyToOne 
	@JoinColumn(name = "yukleyen_kullanici_id", nullable = false)
	@JsonIgnoreProperties({"documents", "loads", "offers", "ratings", "notifications", "sifreHash"}) 
	private User yukleyenKullanici;

    @CreationTimestamp 
	private LocalDateTime yuklenmeTarihi;
	
    @PrePersist
    protected void onCreate() {
        this.yuklenmeTarihi = LocalDateTime.now();
        
    }

    @PreUpdate
    protected void onUpdate() {
        this.yuklenmeTarihi = LocalDateTime.now();
    }

}
