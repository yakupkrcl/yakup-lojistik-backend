package com.yakupProje.dto;

import java.time.LocalDateTime;

import com.yakupProje.enums.DocumentType;

import lombok.Data;

@Data
public class DtoDocument {
	private Long id;
	private String dosyaAdi;
	private String depolamaYolu;
    private String mimeTipi;
    private DocumentType belgeTipi;
    private LocalDateTime yuklenmeTarihi;
    private String status;
    private Long yukId;
    private Long yukleyenKullaniciId;
    
    private DtoLoadLite yuk; 
    private DtoUserLite yukleyenKullanici;

}
