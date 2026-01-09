package com.yakupProje.dto;

import lombok.Data;

import java.time.LocalDateTime;

import com.yakupProje.enums.OfferStatus;

@Data
public class DtoOffer {
	private Long id;
    private Double teklifFiyati;
    private String note;
    private LocalDateTime gecerlilikTarihi;
    private OfferStatus durum;
    private LocalDateTime olusturulmaTarihi;
    private LocalDateTime guncellenmeTarihi;
    private String odemeYontemi;
    private Long yukId;
    private Long tasiyiciId;
    
    private DtoLoad yuk; 
    private DtoUserLite tasiyici; 
    private DtoTransactionLite transaction;
}



