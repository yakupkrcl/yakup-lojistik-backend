package com.yakupProje.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.yakupProje.enums.LoadStatus; // LoadStatus Enum'unuzu import edin

/**
 * Yükün durumunu güncellemek için kullanılan DTO.
 * Frontend'den gelen { "newStatus": "YOLDA" } JSON'unu karşılar.
 */
@Data 
@AllArgsConstructor
@NoArgsConstructor
public class LoadStatusUpdateRequest {
    
    private LoadStatus newStatus; 
}