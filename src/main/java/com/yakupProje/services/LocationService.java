package com.yakupProje.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set; 

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.yakupProje.dto.DtoLoadLite; 
import com.yakupProje.dto.DtoLocation;
import com.yakupProje.dto.DtoLocationIU;
import com.yakupProje.entity.Load;   
import com.yakupProje.entity.Location;
import com.yakupProje.repository.LocationRepository;

@Service
public class LocationService implements ILocationService{

	
	private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

	@Override
	public DtoLocation saveLocation(DtoLocationIU dtoLocationIU) {
        Location location = new Location();
        BeanUtils.copyProperties(dtoLocationIU, location);
        
        locationRepository.save(location);
        
        DtoLocation dtoLocation = new DtoLocation();
        BeanUtils.copyProperties(location, dtoLocation);
        
        Set<Load> kalkisYukSet = location.getKalkisYükleri();
        if (kalkisYukSet != null && !kalkisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : kalkisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setKalkisYükleri(liteList);
            dtoLocation.setKalkisYükSayisi((long) liteList.size()); // Sayı da set edildi
        } else {
            dtoLocation.setKalkisYükSayisi(0L);
        }
        
        Set<Load> varisYukSet = location.getVarisYükleri();
        if (varisYukSet != null && !varisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : varisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setVarisYükleri(liteList);
        }
        
		return dtoLocation;
	}

	@Override
	public List<DtoLocation> getAllLocations() {
		List<Location> locatList = locationRepository.findAll();
		List< DtoLocation> dtoLocations = new ArrayList<>();

		
		for (Location location : locatList) {
			DtoLocation dtoLocation = new DtoLocation();
			BeanUtils.copyProperties(location, dtoLocation);
	
            Set<Load> kalkisYukSet = location.getKalkisYükleri();
            if (kalkisYukSet != null && !kalkisYukSet.isEmpty()) {
                List<DtoLoadLite> liteList = new ArrayList<>();
                for (Load load : kalkisYukSet) {
                    DtoLoadLite lite = new DtoLoadLite();
                    BeanUtils.copyProperties(load, lite);
                    lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                    lite.setVarisAdresiId(load.getVarisAdresi().getId());
                    liteList.add(lite);
                }
                dtoLocation.setKalkisYükleri(liteList);
                dtoLocation.setKalkisYükSayisi((long) liteList.size());
            } else {
                dtoLocation.setKalkisYükSayisi(0L);
            }
            
            Set<Load> varisYukSet = location.getVarisYükleri();
            if (varisYukSet != null && !varisYukSet.isEmpty()) {
                List<DtoLoadLite> liteList = new ArrayList<>();
                for (Load load : varisYukSet) {
                    DtoLoadLite lite = new DtoLoadLite();
                    BeanUtils.copyProperties(load, lite);
                    lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                    lite.setVarisAdresiId(load.getVarisAdresi().getId());
                    liteList.add(lite);
                }
                dtoLocation.setVarisYükleri(liteList);
            }
			
			dtoLocations.add(dtoLocation);
		}
		
		return dtoLocations;
		
	}
    
    @Override
    public Optional<DtoLocation> getLocationById(Long id) {
        Optional<Location> locatiOptional = locationRepository.findById(id);

        if (locatiOptional.isPresent()) {
            Location location = locatiOptional.get();
            
            DtoLocation dtoLocation = new DtoLocation();
            BeanUtils.copyProperties(location, dtoLocation);

            Set<Load> kalkisYukSet = location.getKalkisYükleri();
            if (kalkisYukSet != null && !kalkisYukSet.isEmpty()) {
                List<DtoLoadLite> liteList = new ArrayList<>();
                for (Load load : kalkisYukSet) {
                    DtoLoadLite lite = new DtoLoadLite();
                    BeanUtils.copyProperties(load, lite);
                    lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                    lite.setVarisAdresiId(load.getVarisAdresi().getId());
                    liteList.add(lite);
                }
                dtoLocation.setKalkisYükleri(liteList);
                dtoLocation.setKalkisYükSayisi((long) liteList.size());
            } else {
                dtoLocation.setKalkisYükSayisi(0L);
            }
            
            Set<Load> varisYukSet = location.getVarisYükleri();
            if (varisYukSet != null && !varisYukSet.isEmpty()) {
                List<DtoLoadLite> liteList = new ArrayList<>();
                for (Load load : varisYukSet) {
                    DtoLoadLite lite = new DtoLoadLite();
                    BeanUtils.copyProperties(load, lite);
                    lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                    lite.setVarisAdresiId(load.getVarisAdresi().getId());
                    liteList.add(lite);
                }
                dtoLocation.setVarisYükleri(liteList);
            }
            
            return Optional.of(dtoLocation);
        }
        return Optional.empty();
    }


	@Override
	public Optional<DtoLocation> updateLocation(Long id, DtoLocationIU dtoLocationIU) {
		Optional<Location> locatiOptional = locationRepository.findById(id);
		
		if (locatiOptional.isEmpty()) {
			throw new RuntimeException("konum bulunamadı");
		}
	
		Location gunceLocation = locatiOptional.get();
		
		gunceLocation.setSehir(dtoLocationIU.getSehir());
		gunceLocation.setIlce(dtoLocationIU.getIlce());
		gunceLocation.setTamAdres(dtoLocationIU.getTamAdres());
		gunceLocation.setEnlem(dtoLocationIU.getEnlem());
		gunceLocation.setBoylam(dtoLocationIU.getBoylam());
		
		Location guncellenmiş = locationRepository.save(gunceLocation);
		
		DtoLocation dtoLocation = new DtoLocation();
		BeanUtils.copyProperties(guncellenmiş, dtoLocation);
        
        Set<Load> kalkisYukSet = guncellenmiş.getKalkisYükleri();
        if (kalkisYukSet != null && !kalkisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : kalkisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setKalkisYükleri(liteList);
            dtoLocation.setKalkisYükSayisi((long) liteList.size());
        } else {
            dtoLocation.setKalkisYükSayisi(0L);
        }
        
        Set<Load> varisYukSet = guncellenmiş.getVarisYükleri();
        if (varisYukSet != null && !varisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : varisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setVarisYükleri(liteList);
        }
		
		
		return Optional.of(dtoLocation);
	}



	@Override
	public Optional<DtoLocation> deleteLocation(Long id) {
		Optional<Location> locatiOptional=locationRepository.findById(id);
		if (locatiOptional.isEmpty()) {
			throw new RuntimeException("konum bulunamadı");
		}
		
		Location location=locatiOptional.get();
        
		DtoLocation dtoLocation=new DtoLocation();
		BeanUtils.copyProperties(location, dtoLocation);
        
        Set<Load> kalkisYukSet = location.getKalkisYükleri();
        if (kalkisYukSet != null && !kalkisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : kalkisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setKalkisYükleri(liteList);
            dtoLocation.setKalkisYükSayisi((long) liteList.size());
        } else {
            dtoLocation.setKalkisYükSayisi(0L);
        }
        
        Set<Load> varisYukSet = location.getVarisYükleri();
        if (varisYukSet != null && !varisYukSet.isEmpty()) {
            List<DtoLoadLite> liteList = new ArrayList<>();
            for (Load load : varisYukSet) {
                DtoLoadLite lite = new DtoLoadLite();
                BeanUtils.copyProperties(load, lite);
                lite.setKalkisAdresiId(load.getKalkisAdresi().getId());
                lite.setVarisAdresiId(load.getVarisAdresi().getId());
                liteList.add(lite);
            }
            dtoLocation.setVarisYükleri(liteList);
        }
		
		locationRepository.delete(location);
		

		return Optional.of(dtoLocation);
	}
	
	public Location getLocationEntityById(Long id) {
		return locationRepository.findById(id)
		        .orElseThrow(() -> new RuntimeException("ID'si " + id + " olan konum bulunamadı."));
	}

}