package com.yakupProje.dto;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoLocation {
    private Long id;
    private String sehir;
	private String ilce;
	private String tamAdres;
    private Double enlem; 
    private Double boylam;
    private Double latitude;
    private Double longitude;
    
    private Long kalkisYükSayisi; 
    
    
    private List<DtoLoadLite> kalkisYükleri;
    private List<DtoLoadLite> varisYükleri;
}
