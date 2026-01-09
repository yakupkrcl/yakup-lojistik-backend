package com.yakupProje.services;

import java.util.List;
import java.util.Optional;

import com.yakupProje.dto.DtoLocation;
import com.yakupProje.dto.DtoLocationIU;
import com.yakupProje.entity.Location;

public interface ILocationService {
	
	public DtoLocation saveLocation(DtoLocationIU dtoLocationIU);
    List<DtoLocation> getAllLocations();
    public Optional<DtoLocation> getLocationById(Long id);
    Optional<DtoLocation> updateLocation(Long id, DtoLocationIU dtoLocationIU);
    Optional<DtoLocation> deleteLocation(Long id);
    public Location getLocationEntityById(Long id);
}
