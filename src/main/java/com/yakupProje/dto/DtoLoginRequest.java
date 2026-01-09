package com.yakupProje.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DtoLoginRequest {

    @NotBlank(message = "Kullanıcı adı/email boş olamaz.")
    private String email;


    @NotBlank(message = "Şifre boş olamaz.")
    private String password;
}