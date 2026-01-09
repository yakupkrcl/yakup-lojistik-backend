package com.yakupProje.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoLocationIU {
	private String sehir;
	private String ilce;
	private String tamAdres;
    private Double enlem; 
    private Double boylam;
    private Double latitude;
    private Double longitude;
}
