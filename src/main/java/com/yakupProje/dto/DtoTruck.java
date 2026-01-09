package com.yakupProje.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DtoTruck {
	private Long id;
    private String plakaNumarasi;
    private String markaModel;
    private Double maxAgirlik;
    private Double maxHacim;
    private String truckType;
    private String durum;
    
    
    private Long truckSahipId; 
    
    private LocalDateTime olusturulmaTarihi;
    private LocalDateTime guncellenmeTarihi;
    
    private DtoUserLite truckSahip;
}
