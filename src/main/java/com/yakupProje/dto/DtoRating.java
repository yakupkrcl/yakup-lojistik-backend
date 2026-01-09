package com.yakupProje.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DtoRating {
	private Long id;
    private Double puan;
    private String yorum;
    private String puanlayanAd;
    private String puanlayanSoyad;
    
    private LocalDateTime olusturulmaTarihi;
    

    private Long puanlayanKullaniciId;
    private Long puanlananKullaniciId;
    private Long yukId;
}