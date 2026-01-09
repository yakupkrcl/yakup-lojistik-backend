package com.yakupProje.dto;



import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yakupProje.enums.LoadStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoLoadIU {
	
	private Double hacimM3;
    private Double agirlikKg;

	private String aciklama;
	private String yukTipi;
    private Long tasiyiciId;
	
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
	private LocalDateTime teslimTarihi;
	private LoadStatus  durum;
	
    private Long kalkisAdresiId; 
    private Long varisAdresiId; 
}