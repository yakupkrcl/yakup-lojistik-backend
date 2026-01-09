package com.yakupProje.dto;

import lombok.Data;
import com.yakupProje.enums.VehicleType;

@Data
public class DtoTruckLite {
    private Long id;
    private String plaka;
    private String marka;
    private VehicleType tip;
    private Double kapasiteTon;
    
    private Long surucuId; 
}
