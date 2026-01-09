package com.yakupProje.dto;

import com.yakupProje.enums.UserType;

import lombok.Data;

@Data
public class DtoUserLite {
    private Long id;
    private String ad; 
    private String soyad;
    private String sirketAdi;
    private UserType userType; 
    private boolean aktif;
    private Double rating;
}
