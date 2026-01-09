package com.yakupProje.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DtoRatingLite {
    private Long id;
    private Integer puan; 
    private String yorum;
    private LocalDateTime olusturulmaTarihi;
    
    private Long puanlayanKullaniciId;
    private Long puanlananKullaniciId;
    private Long yukId;
   
}
