package com.yakupProje.dto;

import com.yakupProje.enums.TransactionStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DtoTransactionLite {
    private Long id;
    private Long yukId;
    private Double miktar;
    private TransactionStatus durum;
    private LocalDateTime islemTarihi;
    private String not;
}