package com.yakupProje.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yakupProje.dto.DtoLocation;
import com.yakupProje.dto.DtoLocationIU;
import com.yakupProje.entity.Location;
import com.yakupProje.services.LocationService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/rest/v1/locations")
public class LocationController {
	
	@Autowired
	private LocationService locationService;
	
	@PostMapping(path = "/save")
	public DtoLocation saveLocation(@RequestBody DtoLocationIU dtoLocationIU) {
		return locationService.saveLocation(dtoLocationIU);
	}
	
	@GetMapping(path = "/{id}")
	public Location getLocationById(@PathVariable Long id) {
		return locationService.getLocationEntityById(id);
	}
	
	@GetMapping(path = "/list")
	public List<DtoLocation> getAllLocations() {
		return locationService.getAllLocations();
	}
	
	@PutMapping(path = "/{id}")
	public ResponseEntity<DtoLocation> updateLocation(@PathVariable Long id,@RequestBody DtoLocationIU dtoLocationIU) {
		return locationService.updateLocation(id, dtoLocationIU)
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	}
	
	
	@DeleteMapping(path = "/{id}")
	public ResponseEntity<DtoLocation> deleteLocation(@PathVariable Long id) {
		return locationService.deleteLocation(id)
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	}
	
	
	
}
