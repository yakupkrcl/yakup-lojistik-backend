package com.yakupProje.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.yakupProje.enums.LoadStatus;
import com.yakupProje.enums.YukTipi;

import lombok.Data;

@Data
public class DtoLoad {
    private Long id;
    private Double agirlikKg;
	private Double hacimM3;
	private String aciklama;
	private LocalDateTime teslimTarihi;
	private Integer teklifSayisi;
    private Long tasiyiciId;
    private String deliveryCode; 
    private Double currentLat;
    private Double currentLng;


    private LocalDateTime olusturulmaTarihi;
    
	
    private YukTipi yukTipi;
    private LoadStatus durum;
    
    private Long kalkisAdresiId;
    private Long varisAdresiId;
    
    private DtoUserLite yukSahibi; 
    private DtoLocationLite kalkisAdresi; 
    private DtoLocationLite varisAdresi;
    private String tasiyiciAd;

    private List<DtoOfferLite> teklifler;
    private List<DtoDocumentLite> dokumentler;
}
