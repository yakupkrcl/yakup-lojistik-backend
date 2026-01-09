package com.yakupProje.dto;

import lombok.Data;

@Data

public class DtoTransactionIU {
	
  
	private Double miktar;
    private Double komisyonTutari;
    private String odemeYontemi;
    private String referansKodu; 
    private String durum;
    

    
    private Long teklifId; 
    private Long yukSahibiId;
    private Long tasiyiciId;
    
}
