package com.yakupProje.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yakupProje.dto.DtoTruck;
import com.yakupProje.dto.DtoTruckIU;
import com.yakupProje.services.ITruckService; 
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rest/v1/trucks")
public class TruckController {

    private final ITruckService truckService;

    public TruckController(ITruckService truckService) {
        this.truckService = truckService;
    }

    @PostMapping(path = "/save")
    public ResponseEntity<DtoTruck> saveTruck(@RequestBody DtoTruckIU dtoTruckIU) {
        try {
            DtoTruck savedTruck = truckService.saveTruck(dtoTruckIU);
            return new ResponseEntity<>(savedTruck, HttpStatus.CREATED); 
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); 
        }
    }

    @GetMapping(path = "/list")
    public ResponseEntity<List<DtoTruck>> getAllTrucks() {
        List<DtoTruck> trucks = truckService.getAllTrucks();
        if (trucks.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); 
        }
        return new ResponseEntity<>(trucks, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DtoTruck> getTruckById(@PathVariable Long id) {
        try {
            DtoTruck truck = truckService.getTruckById(id);
            return new ResponseEntity<>(truck, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoTruck> updateTruck(@PathVariable Long id, @RequestBody DtoTruckIU dtoTruckIU) {
        try {
            DtoTruck updatedTruck = truckService.updateTruck(id, dtoTruckIU);
            return new ResponseEntity<>(updatedTruck, HttpStatus.OK);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("bulunamadı")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); 
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DtoTruck> deleteTruck(@PathVariable Long id) {
        try {
            DtoTruck deletedTruck = truckService.deleteTruck(id);
            return new ResponseEntity<>(deletedTruck, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }
}