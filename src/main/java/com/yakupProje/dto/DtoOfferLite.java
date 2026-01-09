package com.yakupProje.dto;

import com.yakupProje.enums.OfferStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DtoOfferLite {
    private Long id;
    private Double teklifFiyati;
    private String note;
    private OfferStatus durum;
    private LocalDateTime gecerlilikTarihi;
    private String odemeYontemi;
    private DtoLocationLite kalkisAdresi; // Bu isimde bir alan olmalı
    private DtoLocationLite varisAdresi;

    private Long tasiyiciId;
    private Long yukId;
}