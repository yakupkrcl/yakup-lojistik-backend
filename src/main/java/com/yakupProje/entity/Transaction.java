package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.UpdateTimestamp;
import com.yakupProje.enums.TransactionStatus;

@Entity
@Getter 
@Setter 
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "transactions")
@EqualsAndHashCode(exclude = {"teklif", "yukSahibi", "tasiyici"}) 
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double miktar;
    
    @Column(name = "komisyon_tutari") // DB sütun adıyla tam eşleşme sağladık
    private Double komisyonTutari;
    
    @Column(name = "olusturulma_tarihi")
    private LocalDateTime olusturulmaTarihi;
    
    @Column(unique = true)
    private String referansKodu; 
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus durum;
    
    @Column(name = "islem_notu")
    private String not;
    
    @UpdateTimestamp
    private LocalDateTime odemeTarihi;
    
    @ManyToOne 
    @JoinColumn(name = "load_id", nullable = false)
    private Load yuk;
    
    @OneToOne
    @JoinColumn(name = "teklif_id", nullable = false)
    private Offer teklif;
    
    @ManyToOne 
    @JoinColumn(name = "yuk_sahibi_id", nullable = false)
    private User yukSahibi;

    @ManyToOne 
    @JoinColumn(name = "tasiyici_id", nullable = false)
    private User tasiyici;
    
    @Column(name = "odeme_yontemi")
    private String odemeYontemi;
    
    // 🚩 TEK BİR METODDA BİRLEŞTİRDİK
    @PrePersist
    @PreUpdate
    protected void handleBeforeSave() {
        // 1. Tarih Ayarı
        if (this.olusturulmaTarihi == null) {
            this.olusturulmaTarihi = LocalDateTime.now();
        }
        
        // 2. Komisyon Hesaplama (Miktar varsa ve komisyon boşsa)
        if (this.miktar != null && (this.komisyonTutari == null || this.komisyonTutari == 0)) {
            this.komisyonTutari = this.miktar * 0.05; // %5
        }
    }
}