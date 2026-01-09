package com.yakupProje.dto;

import java.time.LocalDateTime;
import com.yakupProje.enums.LoadStatus;
import com.yakupProje.enums.YukTipi;

import lombok.Data;

@Data
public class DtoLoadLite {
    private Long id;
    
    private Double agirlikKg;
    private Double hacimM3;
    private YukTipi yukTipi;
    private LocalDateTime teslimTarihi;
    private LoadStatus durum; 
    private Integer teklifSayisi;
    private Long tasiyiciId;
    private Long kalkisAdresiId; 
    private Long varisAdresiId;  
}
