package com.yakupProje.dto;

import lombok.Data;

@Data
public class DtoTruckIU { 
	private String plakaNumarasi;
    private String markaModel;
    private Double maxAgirlik;
    private Double maxHacim;
    
    private String truckType; 
    private String durum;
    

    private Long truckSahipId;


}