package com.yakupProje.dto;

import lombok.Data;

@Data
public class DtoLocationLite {
	private Long id;
    private String sehir;
    private String ilce;
    private String tamAdres;
    private Double enlem; 
    private Double boylam;
    private Double latitude;
    private Double longitude;
}