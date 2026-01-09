package com.yakupProje.dto;

import com.yakupProje.enums.DocumentType;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DtoDocumentLite {
    private Long id;
    private String dosyaAdi;
    private DocumentType belgeTipi;
    private LocalDateTime yuklenmeTarihi;
    
    private Long yukleyenKullaniciId;
}