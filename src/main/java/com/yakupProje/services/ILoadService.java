package com.yakupProje.services;


import java.util.List;
import java.util.Optional;

import com.yakupProje.dto.DtoLoad;
import com.yakupProje.dto.DtoLoadIU;
import com.yakupProje.entity.Load;
import com.yakupProje.enums.LoadStatus;


public interface ILoadService {
	
	public void confirmDeliveryWithCode(Long loadId, String code);
	public List<DtoLoad> getShipperCompletedLoads(String ownerEmail);
	public void completeLoad(Long loadId, String driverEmail);
	public void updateCurrentLocation(Long id, Double lat, Double lng);	
	public DtoLoad save(DtoLoadIU dtoLoadIU, String yukSahibiEmail);
	public Optional<DtoLoad> updateLoadStatusdriver(Long loadId, LoadStatus durum, String driverEmail);
	public List<DtoLoad> getList();
	
	List<DtoLoad> getLoadsByDriver(String driverEmail);
	public Optional<DtoLoad> getLoadId(Long id);	
	List<DtoLoad> getLoadsByOwner(String ownerEmail); // Yük Sahibi (SHIPPER) için
    List<DtoLoad> getLoadsByStatus(LoadStatus durum); // Taşıyıcı (DRIVER) için (Durum: YAYINDA)
    Optional<DtoLoad> deleteLoadByOwner(Long id, String kullaniciEmail); // Silme yetki kontrolü ile
    Optional<DtoLoad> updateLoad(Long id, DtoLoadIU dtoLoadIU, String kullaniciEmail); 
    Optional<DtoLoad> updateLoadStatus(
            Long loadId,
            LoadStatus durum,
            String adminEmail
    );
	public Load getLoadEntityById(Long id);
    
    
}