package com.yakupProje.services;

import com.yakupProje.dto.DtoTruck;
import com.yakupProje.dto.DtoTruckIU;
import com.yakupProje.entity.Truck;

import java.util.List;

public interface ITruckService {
    DtoTruck saveTruck(DtoTruckIU dtoTruckIU);
    List<DtoTruck> getAllTrucks();
    DtoTruck getTruckById(Long id);
    DtoTruck updateTruck(Long id, DtoTruckIU dtoTruckIU);
   DtoTruck deleteTruck(Long id);
    public Truck getTruckEntityById(Long id);
}
//