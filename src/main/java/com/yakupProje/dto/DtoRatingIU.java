package com.yakupProje.dto;

import lombok.Data;

@Data
public class DtoRatingIU {
	private Double puan;
    private String yorum;
    
   
    private Long puanlayanKullaniciId; 
    private Long puanlananKullaniciId;
    private Long yukId;
    
}
