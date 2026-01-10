package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.Set;
import com.yakupProje.enums.YukTipi;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yakupProje.enums.LoadStatus;

@Entity
@Getter 
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "loads")
@EqualsAndHashCode(exclude = {"yukTipi","yukSahibi", "kalkisAdresi", "varisAdresi", "teklifler", "dokumentler"})
public class Load {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Double agirlikKg; 
    private Double hacimM3;  
    private String aciklama;
    private Long tasiyiciId;
    
    // Güvenli Teslimat Kodu alanı
    private String deliveryCode; 

    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;
    
    @Enumerated(EnumType.STRING)
    private YukTipi yukTipi; 
    
    private LocalDateTime teslimTarihi;
    
    @Enumerated(EnumType.STRING)
    private LoadStatus durum;

    private LocalDateTime olusturulmaTarihi;

    @ManyToOne() 
    @JoinColumn(name = "yuk_sahibi_id")
    private User yukSahibi; 

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "kalkis_adres_id")
    private Location kalkisAdresi; 
    
    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "varis_adres_id")
    private Location varisAdresi; 

    @OneToMany(mappedBy = "yuk")
    private Set<Offer> teklifler;
    
    @OneToMany(mappedBy = "yuk")
    @JsonIgnore
    private Set<Document> dokumentler;

    @PrePersist
    protected void onCreate() {
        this.olusturulmaTarihi = LocalDateTime.now();
        if (this.durum == null) this.durum = LoadStatus.YAYINDA;
        if (this.yukTipi == null) this.yukTipi = YukTipi.STANDART;
    }
}