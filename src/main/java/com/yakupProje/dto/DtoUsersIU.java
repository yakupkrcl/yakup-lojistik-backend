package com.yakupProje.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DtoUsersIU {

	private String ad; 
    private String soyad;

	@Email(message = "Geçerli bir e-posta adresi giriniz.")
	private String email;
	private String password;
	private String sirketAdi;
	private String vergiNumarasi;
	private String telefon;
	private boolean aktif;

	private String userType;

}

