package com.yakupProje.dto;


import lombok.Data;

@Data
public class DtoJwtResponse {
	private Long id; 
    private String token;
    private String ad;
    private String soyad;
    private String email;
    private String userType;
}
