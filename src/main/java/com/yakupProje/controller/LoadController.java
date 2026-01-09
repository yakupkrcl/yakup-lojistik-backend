package com.yakupProje.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Optional;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yakupProje.dto.DtoLoad;
import com.yakupProje.dto.DtoLoadIU;
import com.yakupProje.dto.DtoLocationIU;
import com.yakupProje.entity.Load;
import com.yakupProje.enums.LoadStatus;
import com.yakupProje.services.ILoadService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rest/v1/loads") 
public class LoadController{
	
	private final ILoadService loadService; 
	
	public LoadController(ILoadService loadService) { 
	    this.loadService = loadService;
	}
	
	
	@GetMapping("/shipper/completed-loads")
	public ResponseEntity<List<DtoLoad>> getCompletedLoads() {
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    
	     
	    if (authentication == null || !authentication.isAuthenticated()) {
	        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	    }
	    
	    String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
	    
	  
	    List<DtoLoad> loads = loadService.getShipperCompletedLoads(userEmail);
	    
	    return new ResponseEntity<>(loads, HttpStatus.OK);
	}
	
	
	@GetMapping("/driver/active-loads")
	public ResponseEntity<List<DtoLoad>> getDriverActiveLoads() {

	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	    if (authentication == null || !authentication.isAuthenticated()) {
	        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
	    }

	    String driverEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

	    List<DtoLoad> loads = loadService.getLoadsByDriver(driverEmail);

	    return new ResponseEntity<>(loads, HttpStatus.OK);
	}

	
	
	@PostMapping("/shipper/save") 
    public ResponseEntity<DtoLoad> createLoad(@RequestBody DtoLoadIU dtoLoadIU) {

      
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal().equals("anonymousUser"))
 {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
     
        if (userEmail == null || authentication == null || !authentication.isAuthenticated()) {
             return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); 
        }

        try {
            DtoLoad savedLoad = loadService.save(dtoLoadIU, userEmail);
            return new ResponseEntity<>(savedLoad, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
	@GetMapping(path = "/shipper/my-loads")
	public ResponseEntity<List<DtoLoad>> getAllLoads() {
	    // ... (Authentication kontrolü kısmı aynı kalsın) ...
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
	    // 1. Yükleri çekme
        List<DtoLoad> loads = loadService.getLoadsByOwner(userEmail);	    
	    // 2. KRİTİK REVİZYON: Liste boş olsa bile 200 OK ve boş liste döndür!
	  
        
        
        if (loads.isEmpty()) {
	        // Eski kod: return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 🚨 Bu 204 veriyordu
	        
	        // Yeni kod: 200 OK ile boş bir liste döndür
	        return new ResponseEntity<>(loads, HttpStatus.OK); 
	    }
	    
	    // 3. Başarılı ve veri var
	    return new ResponseEntity<>(loads, HttpStatus.OK);
	}
	
	@GetMapping("/driver/loads")
	public List<DtoLoad> getDriverLoads() {
	    return loadService.getLoadsByStatus(LoadStatus.YAYINDA);
	}

	// LoadController.java içine
	@GetMapping("/{id}/current-location")
	public ResponseEntity<?> getCurrentLocation(@PathVariable Long id) {
	    Load load = loadService.getLoadEntityById(id);
	    // Sadece koordinatları dönen basit bir Map veya DTO yapalım
	    return ResponseEntity.ok(Map.of(
	        "currentLat", load.getCurrentLat(),
	        "currentLng", load.getCurrentLng()
	    ));
	}
	
	@PutMapping("/driver/complete-with-code/{id}")
    @PreAuthorize("hasRole('TASIYICI')")
    public ResponseEntity<?> completeWithCode(
            @PathVariable Long id, 
            @RequestParam String kod // URL'den ?kod=123456 şeklinde okur
    ) {
        try {
            // Bir önceki mesajda verdiğim servis metodunu çağırır
            loadService.confirmDeliveryWithCode(id, kod);
            return ResponseEntity.ok(Map.of("message", "Yük başarıyla teslim edildi."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
	
    @PostMapping("/{id}/update-location")
    @PreAuthorize("hasRole('TASIYICI')")
    public ResponseEntity<Void> updateLocation(
            @PathVariable Long id,
            @RequestParam Double lat,
            @RequestParam Double lng
    ) {
        loadService.updateCurrentLocation(id, lat, lng);
        return ResponseEntity.ok().build();
    }

	@GetMapping("/driver/detail/{id}")
    public ResponseEntity<DtoLoad> getLoadForDriver(@PathVariable Long id) {
        // 🚨 Servis, bu yükün Taşıyıcı tarafından görülmeye uygun olup olmadığını kontrol etmeli.
        return loadService.getLoadId(id) 
                .map(ResponseEntity::ok) 
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@GetMapping(path = "/admin/list-all")
    public ResponseEntity<List<DtoLoad>> getAllLoadsAdmin() {
        // ... (Authentication kontrolü kısmı ADMIN rolü için yapılmalı) ...
        List<DtoLoad> loads = loadService.getList(); // Servis tüm yükleri çeker (Admin yetkisiyle)
        return new ResponseEntity<>(loads, HttpStatus.OK);
    }
	
	@DeleteMapping("/shipper/{id}")
    public ResponseEntity<DtoLoad> deleteLoadByShipper(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String kullaniciEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        
        try {
            // 🚨 KRİTİK KONTROL: Servis katmanında yük sahibinin kendi yükü olup olmadığı kontrol edilmeli.
            Optional<DtoLoad> deletedLoad = loadService.deleteLoadByOwner(id, kullaniciEmail);
            return deletedLoad
                    .map(ResponseEntity::ok) 
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
             return new ResponseEntity<>(HttpStatus.FORBIDDEN); // Yetki yoksa 403 Forbidden
        }
    }
	@GetMapping("/public")
	public ResponseEntity<List<DtoLoad>> getPublicLoads() {
	    List<DtoLoad> loads = loadService.getLoadsByStatus(LoadStatus.YAYINDA);
	    return ResponseEntity.ok(loads);
	}

	
	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/admin/{id}/status")
	public ResponseEntity<?> updateLoadStatus(
	        @PathVariable Long id,
	        @RequestBody Map<String, String> body,
	        Principal principal
	) {
	    LoadStatus durum = LoadStatus.valueOf(body.get("durum"));

	    return loadService
	            .updateLoadStatus(id, durum, principal.getName())
	            .map(ResponseEntity::ok)
	            .orElse(ResponseEntity.notFound().build());
	}

	@PreAuthorize("hasAuthority('ROLE_TASIYICI')")
	@PutMapping("/driver/update-status/{id}")
	public ResponseEntity<?> updateLoadStatusdriver(
	        @PathVariable Long id,
	        @RequestBody Map<String, String> body,
	        Principal principal
	) {
	    LoadStatus durum = LoadStatus.valueOf(body.get("durum"));

	    return loadService
	            .updateLoadStatus(id, durum, principal.getName())
	            .map(ResponseEntity::ok)
	            .orElse(ResponseEntity.notFound().build());
	}
    @PutMapping("/{id}")
    public ResponseEntity<DtoLoad> updateLoad(@PathVariable Long id, @RequestBody DtoLoadIU dtoLoadIU) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String kullaniciEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        
        // 🚨 KRİTİK KONTROL: Servis katmanında bu kullanıcının bu yükü güncelleme yetkisi KONTROL EDİLMELİ.
        try {
             Optional<DtoLoad> updatedLoad = loadService.updateLoad(id, dtoLoadIU, kullaniciEmail);
             return updatedLoad.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
             return new ResponseEntity<>(HttpStatus.FORBIDDEN); // Yetki yoksa 403 Forbidden
        }
    }
    
    @GetMapping("/detail/{id}")
    public ResponseEntity<DtoLoad> getLoadById(@PathVariable Long id) {
        return loadService.getLoadId(id) 
                .map(ResponseEntity::ok) 
                .orElseGet(() -> ResponseEntity.notFound().build()); 
    }
    
    // NOT: updateLoadStatus ve getMyActiveLoadsForDriver rotaları sizin isteğiniz üzerine silinmiştir.
}