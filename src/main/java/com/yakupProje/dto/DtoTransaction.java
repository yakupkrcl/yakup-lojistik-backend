package com.yakupProje.dto;

import java.time.LocalDateTime;

import com.yakupProje.enums.TransactionStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoTransaction {
	private Long id;
	
    private Double miktar;
    private Double komisyonTutari;
    private String odemeYontemi;
    private String referansKodu;
    private TransactionStatus durum; 
    private LocalDateTime odemeTarihi;
	private LocalDateTime olusturulmaTarihi;
	private String not;
	private String kalkisSehri;
	private String varisSehri;
	
	private String yukSahibiAdSoyad;
	private String tasiyiciAdSoyad;
    
    private String yukSahibiEmail; 
    private String tasiyiciEmail;
	
    private Long teklifId;
    private Long yukSahibiId;
    private Long tasiyiciId;
    
    private DtoOfferLite teklif; 
    private DtoUserLite yukSahibi; 
    private DtoUserLite tasiyici;
    
}
