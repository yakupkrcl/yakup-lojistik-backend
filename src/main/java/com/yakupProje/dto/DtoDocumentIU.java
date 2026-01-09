package com.yakupProje.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DtoDocumentIU {
	@NotBlank(message = "Dosya adı boş bırakılamaz.")
	private String dosyaAdi;
	
	private String depolamaYolu;
	private String mimeTipi;
	
	@NotBlank(message = "Belge tipi belirtilmelidir.")
    private String belgeTipi;    
   
    @NotNull(message = "Belge hangi yüke ait belirtilmelidir.")
    private Long yukId;
   
    @NotNull(message = "Yükleyen kullanıcı ID'si zorunludur.")
    private Long yukleyenKullaniciId;
}