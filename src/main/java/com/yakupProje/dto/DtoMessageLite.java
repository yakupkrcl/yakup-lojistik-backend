package com.yakupProje.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DtoMessageLite {
    private Long id;
    private String mesajMetni;
    private Boolean okunduMu;
    private LocalDateTime olusturulmaTarihi;
    
    private Long gonderenId;
    private Long aliciId;
    private Long yukId;
}