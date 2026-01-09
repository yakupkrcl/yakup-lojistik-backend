package com.yakupProje.services;

import com.yakupProje.dto.DtoTruck;
import com.yakupProje.dto.DtoTruckIU;
import com.yakupProje.dto.DtoUserLite; // Lite DTO'yu kullanmak için gerekli
import com.yakupProje.entity.Truck;
import com.yakupProje.entity.User;
import com.yakupProje.enums.TruckType;
import com.yakupProje.repository.TruckRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TruckService implements ITruckService {

    private final UserService userService;
    private final TruckRepository truckRepository;

    public TruckService(UserService userService, TruckRepository truckRepository) {
        this.userService = userService;
        this.truckRepository = truckRepository;
    }

    @Override
    public DtoTruck saveTruck(DtoTruckIU dtoTruckIU) {
        User user = userService.getUserEntityById(dtoTruckIU.getTruckSahipId());

        Truck truck = new Truck();
        BeanUtils.copyProperties(dtoTruckIU, truck);
        
        truck.setTruckSahip(user);
        
        if (dtoTruckIU.getTruckType() != null && !dtoTruckIU.getTruckType().isEmpty()) {
            try {
                TruckType type = TruckType.valueOf(dtoTruckIU.getTruckType().toUpperCase());
                truck.setTruckType(type);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Geçersiz Tır Tipi: " + dtoTruckIU.getTruckType());
            }
        } else {
            truck.setTruckType(TruckType.valueOf("STANDART"));
        }

        Truck dbTruck = truckRepository.save(truck);
        
        DtoTruck dtoTruck = new DtoTruck();
        BeanUtils.copyProperties(dbTruck, dtoTruck);
        
        dtoTruck.setTruckSahipId(dbTruck.getTruckSahip().getId());
        
 
        if (dbTruck.getTruckSahip() != null) {
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(dbTruck.getTruckSahip(), userLite);
            dtoTruck.setTruckSahip(userLite); // DtoTruck objesindeki truckSahip alanına atandı
        }
        
        return dtoTruck;
    }

    @Override
    public List<DtoTruck> getAllTrucks() {
        List<Truck> dbTrucks = truckRepository.findAll();
        List<DtoTruck> dtoTrucks = new ArrayList<>();

      
        for (Truck truck : dbTrucks) {
            DtoTruck dto = new DtoTruck();
            BeanUtils.copyProperties(truck, dto);
            
           
            if(truck.getTruckSahip() != null) {
                 dto.setTruckSahipId(truck.getTruckSahip().getId());
                 
                 DtoUserLite userLite = new DtoUserLite();
                 BeanUtils.copyProperties(truck.getTruckSahip(), userLite);
                 dto.setTruckSahip(userLite);
            }
            
            dtoTrucks.add(dto);
        }

        return dtoTrucks;
    }

    @Override
    public DtoTruck getTruckById(Long id) {
        Truck truck = this.getTruckEntityById(id);
        
        DtoTruck dtoTruck = new DtoTruck();
        BeanUtils.copyProperties(truck, dtoTruck);

  
        dtoTruck.setTruckSahipId(truck.getTruckSahip().getId());


        if (truck.getTruckSahip() != null) {
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(truck.getTruckSahip(), userLite);
            dtoTruck.setTruckSahip(userLite);
        }

        return dtoTruck;
    }

    @Override
    public DtoTruck updateTruck(Long id, DtoTruckIU dtoTruckIU) {
        Truck dbTruck = this.getTruckEntityById(id);

      BeanUtils.copyProperties(dtoTruckIU, dbTruck, "id", "truckSahip"); 
        
     
        if (dtoTruckIU.getTruckType() != null && !dtoTruckIU.getTruckType().isEmpty()) {
            try {
                TruckType type = TruckType.valueOf(dtoTruckIU.getTruckType().toUpperCase());
                dbTruck.setTruckType(type);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Geçersiz Tır Tipi: " + dtoTruckIU.getTruckType());
            }
        }
           if (!dbTruck.getTruckSahip().getId().equals(dtoTruckIU.getTruckSahipId())) {
            User newUser = userService.getUserEntityById(dtoTruckIU.getTruckSahipId());
            dbTruck.setTruckSahip(newUser);
        }
        
        Truck updateTruck = truckRepository.save(dbTruck);
         DtoTruck dto = new DtoTruck();
        BeanUtils.copyProperties(updateTruck, dto);
        

        dto.setTruckSahipId(updateTruck.getTruckSahip().getId());


        if (updateTruck.getTruckSahip() != null) {
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(updateTruck.getTruckSahip(), userLite);
            dto.setTruckSahip(userLite);
        }
        
        return dto;
    }

    @Override
    public DtoTruck deleteTruck(Long id) {
        Truck dbTruck = this.getTruckEntityById(id);
        
    
        DtoTruck dto = new DtoTruck();
        BeanUtils.copyProperties(dbTruck, dto);
        

        dto.setTruckSahipId(dbTruck.getTruckSahip().getId());

        if (dbTruck.getTruckSahip() != null) {
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(dbTruck.getTruckSahip(), userLite);
            dto.setTruckSahip(userLite);
        }
        
        truckRepository.delete(dbTruck);
        
        return dto;
    }

    public Truck getTruckEntityById(Long id) {
        return truckRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("ID'si " + id + " olan kamyon bulunamadı."));
    }
}