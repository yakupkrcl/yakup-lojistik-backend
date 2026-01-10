
package com.yakupProje.entity;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.yakupProje.enums.OfferStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter 
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "offers")
@EqualsAndHashCode(exclude = {"yuk", "tasiyici", "transaction"}) 
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double teklifFiyati;
    @Column(name = "note")
    private String note;
    
    private LocalDateTime gecerlilikTarihi;

    @Enumerated(EnumType.STRING)
    private OfferStatus durum;
    
    @Column(name = "odeme_yontemi")
    private String odemeYontemi;

    @CreationTimestamp
    private LocalDateTime olusturulmaTarihi;
    @CreationTimestamp
    private LocalDateTime guncellenmeTarihi;
    
    @ManyToOne 
    @JoinColumn(name = "load_id", nullable = false)
    @JsonIgnoreProperties({"teklifler", "dokumentler", "yukSahibi"})
    private Load yuk;
    
    @ManyToOne 
    @JoinColumn(name = "tasiyici_id", nullable = false)
    @JsonIgnoreProperties({"offers", "trucks", "ratingsPuanlanan", "yuklenenDokumentler", "sifreHash"})
    private User tasiyici;
    
    @OneToOne(mappedBy = "teklif", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Transaction transaction;
    
    

 
}

