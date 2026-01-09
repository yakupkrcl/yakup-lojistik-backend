package com.yakupProje.services;

import com.yakupProje.dto.*; 
import com.yakupProje.entity.Document;
import com.yakupProje.entity.Load;
import com.yakupProje.entity.Location;
import com.yakupProje.entity.Offer;
import com.yakupProje.entity.User;
import com.yakupProje.enums.LoadStatus;
import com.yakupProje.enums.OfferStatus;
import com.yakupProje.enums.TransactionStatus;
import com.yakupProje.enums.YukTipi;
import com.yakupProje.repository.LoadRepository;
import com.yakupProje.repository.OfferRepository;
import com.yakupProje.repository.TransactionRepository;
import com.yakupProje.repository.UserRepository;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoadService implements ILoadService {

	@Autowired
    private NotificationService notificationService;
	private final UserRepository userRepository;
	private final OfferRepository offerRepository;
	private final TransactionRepository transactionRepository;

    private final UserService userService;
    private final LocationService locationService;
    private final LoadRepository loadRepository;
    

    public LoadService(LoadRepository loadRepository,
    		TransactionRepository transactionRepository,
    		OfferRepository offerRepository,
    		UserRepository userRepository,
                       UserService userService,
                       LocationService locationService) {
        this.userRepository=userRepository;
        this.transactionRepository=transactionRepository;
    	this.offerRepository=offerRepository;
        this.loadRepository = loadRepository;
        this.userService = userService;
        this.locationService = locationService;
    }
    
    @Transactional
    public void updateCurrentLocation(Long id, Double lat, Double lng) {
        int updated = loadRepository.updateCurrentLocation(id, lat, lng);

        if (updated == 0) {
            throw new RuntimeException("Yük bulunamadı");
        }

        System.out.println("📍 [DB UPDATE] Yük ID: " + id + 
            " -> Yeni Konum: " + lat + "," + lng);
    }

    
    @Override
    public List<DtoLoad> getLoadsByDriver(String driverEmail) {

        User driver = userService.getUserEntityByEmail(driverEmail);

        // ❌ Pasifse boş liste dön
        if (driver == null || !driver.isAktif()) {
            return List.of();
        }

        return loadRepository.findAll().stream()
            .filter(load -> load.getTeklifler().stream()
                .anyMatch(offer ->
                    offer.getTasiyici().getId().equals(driver.getId()) &&
                    (offer.getDurum() == OfferStatus.KABUL_EDILDI ||
                     offer.getDurum() == OfferStatus.YOLDA)
                )
            )
            .map(this::convertToFullDto)
            .collect(Collectors.toList());
    }
    
    
    @Transactional
    public void confirmDeliveryWithCode(Long loadId, String code) {
        Load load = loadRepository.findById(loadId)
                .orElseThrow(() -> new RuntimeException("Yük bulunamadı"));

        // 1. Kod Kontrolü
        if (load.getDeliveryCode() == null || !load.getDeliveryCode().equals(code)) {
            throw new RuntimeException("Hatalı onay kodu! Lütfen yük sahibinden doğru kodu isteyin.");
        }

        // 2. Kabul edilmiş teklifi bul
        Offer acceptedOffer = offerRepository.findByYukAndDurum(load, OfferStatus.KABUL_EDILDI);
        if (acceptedOffer == null) {
            throw new RuntimeException("Onaylanmış bir teklif bulunamadı.");
        }

        // 3. 💰 Finansal İşlemler
        User carrier = acceptedOffer.getTasiyici();
        if (!carrier.isAktif()) {
            throw new RuntimeException("Hesabınız aktif değil. Teslimat tamamlanamaz.");
        }

        Double tutar = acceptedOffer.getTeklifFiyati();
        carrier.setBalance((carrier.getBalance() != null ? carrier.getBalance() : 0.0) + tutar);
        userRepository.save(carrier);

        // 4. ✅ Durumları Güncelle
        load.setDurum(LoadStatus.TESLIM_EDILDI);
        load.setDeliveryCode(null);
        acceptedOffer.setDurum(OfferStatus.TAMAMLANDI);
        
        loadRepository.save(load);
        offerRepository.save(acceptedOffer);

        // 5. 🧾 İşlem Kaydı (Transaction)
        transactionRepository.findByTeklif_Id(acceptedOffer.getId()).ifPresent(tx -> {
            tx.setDurum(TransactionStatus.TAMAMLANDI);
            transactionRepository.save(tx);
        });

        // ---------------------------------------------------------
        // 🔔 6. BİLDİRİMLER (ÇİFT TARAFLI)
        // ---------------------------------------------------------

        // A) Yük Sahibine Bildirim
        notificationService.createNotification(
            load.getYukSahibi().getId(),
            "✅ Teslimat Başarılı! #" + loadId + " nolu yükünüz kodla doğrulandı ve teslim edildi.",
            loadId, "/shipper/completed-loads"
        );

        // B) 🔥 Sürücüye (Carrier) Bildirim (Senin istediğin kısım)
        notificationService.createNotification(
            carrier.getId(),
            "💰 Ödeme Hesabınızda! #" + loadId + " nolu yükü başarıyla teslim ettiniz. " + tutar + " TL bakiyenize eklendi.",
            loadId, "/driver/earnings" // Sürücünün kazancını göreceği sayfa linki
        );

        System.out.println("🔔 [BİLDİRİM] Sürücü " + carrier.getAd() + " için ödeme bildirimi oluşturuldu.");
    }
    // 2. Kod Üretimi (save metodunun içinde zaten var ama kontrol et)
    // load.setDeliveryCode(String.format("%06d", number)); satırı kodunda var, süper.
    @Transactional
    @Override
    public List<DtoLoad> getLoadsByOwner(String ownerEmail) {

        List<Load> loads = loadRepository.findByYukSahibi_Email(ownerEmail);
        List<DtoLoad> dtoList = new ArrayList<>();

        for (Load load : loads) {
            DtoLoad dtoLoad = new DtoLoad();
            BeanUtils.copyProperties(load, dtoLoad);

            // Meseleyi çözen blok burası:
            if (load.getTasiyiciId() != null) {
                // 1. UserService üzerinden şoförün bilgilerini (ad, soyad) getiriyoruz
                User tasiyici = userService.getUserEntityById(load.getTasiyiciId());
                
                if (tasiyici != null) {
                    // 2. User entity'ndeki 'ad' ve 'soyad' alanlarını birleştirip DTO'ya setliyoruz
                    dtoLoad.setTasiyiciAd(tasiyici.getAd() + " " + tasiyici.getSoyad());
                } else {
                    dtoLoad.setTasiyiciAd("Şoför Bulunamadı (ID: " + load.getTasiyiciId() + ")");
                }
            } else {
                dtoLoad.setTasiyiciAd("Henüz Atanmadı");
            }
            // Yük Sahibi
            if (load.getYukSahibi() != null) {
                DtoUserLite userLite = new DtoUserLite();
                BeanUtils.copyProperties(load.getYukSahibi(), userLite);
                dtoLoad.setYukSahibi(userLite);
            }

            // Kalkış
            if (load.getKalkisAdresi() != null) {
                dtoLoad.setKalkisAdresiId(load.getKalkisAdresi().getId());
                DtoLocationLite kalkisLite = new DtoLocationLite();
                BeanUtils.copyProperties(load.getKalkisAdresi(), kalkisLite);
                dtoLoad.setKalkisAdresi(kalkisLite);
            }

            // Varış
            if (load.getVarisAdresi() != null) {
                dtoLoad.setVarisAdresiId(load.getVarisAdresi().getId());
                DtoLocationLite varisLite = new DtoLocationLite();
                BeanUtils.copyProperties(load.getVarisAdresi(), varisLite);
                dtoLoad.setVarisAdresi(varisLite);
            }
      
            if (load.getTeklifler() != null && !load.getTeklifler().isEmpty()) {
                List<DtoOfferLite> offerList = new ArrayList<>();
                for (Offer offer : load.getTeklifler()) {
                    DtoOfferLite lite = new DtoOfferLite();
                    BeanUtils.copyProperties(offer, lite);
                    lite.setYukId(load.getId());
                    offerList.add(lite);
                }
                dtoLoad.setTeklifler(offerList);
            }

            dtoList.add(dtoLoad);
        }

        return dtoList;
    }



    public List<DtoLoad> getLoadsByStatus(LoadStatus durum) {
        List<Load> loads = loadRepository.findByDurum(durum); 
        return loads.stream()
                    .map(this::convertToFullDto)
                    .collect(Collectors.toList());
    }

    private DtoLoad convertToDto(Load load) {
        DtoLoad dto = new DtoLoad();
        dto.setId(load.getId());
        dto.setYukTipi(load.getYukTipi());
        dto.setAciklama(load.getAciklama());
        dto.setDurum(load.getDurum());
        dto.setTeslimTarihi(load.getTeslimTarihi());
        dto.setAgirlikKg(load.getAgirlikKg());
        dto.setHacimM3(load.getHacimM3());
        return dto;
    }
    @Override
    public DtoLoad save(DtoLoadIU dtoLoadIU, String yukSahibiEmail) {
        User yukSahibi = userService.getUserEntityByEmail(yukSahibiEmail);
        Location kalkısAdres = locationService.getLocationEntityById(dtoLoadIU.getKalkisAdresiId());
        Location varısAdres = locationService.getLocationEntityById(dtoLoadIU.getVarisAdresiId());

        
        
        Load load = new Load();
        BeanUtils.copyProperties(dtoLoadIU, load);
        
        // 🚩 BURADAKİ RANDOM KODU SİLDİK! 
        load.setDeliveryCode(null); 
        
        load.setDurum(LoadStatus.YAYINDA);
        load.setYukSahibi(yukSahibi);
        load.setKalkisAdresi(kalkısAdres);
        load.setVarisAdresi(varısAdres);

        Load dbLoad = loadRepository.save(load);
        return convertToFullDto(dbLoad);
    }

    private User checkActiveDriver(String driverEmail) {
        User driver = userService.getUserEntityByEmail(driverEmail);

        if (driver == null) {
            throw new RuntimeException("Sürücü bulunamadı");
        }

        if (!driver.isAktif()) {
            throw new RuntimeException("Sürücü aktif değil. İşlem yapılamaz.");
        }

        return driver;
    }

    
    @Override
    public List<DtoLoad> getList() {
        List<Load> loads = loadRepository.findAll();
        List<DtoLoad> dtoList = new ArrayList<>();

        for (Load load : loads) {
            DtoLoad dtoLoad = new DtoLoad();
            BeanUtils.copyProperties(load, dtoLoad);
            
            if (load.getYukSahibi() != null) {
                DtoUserLite userLite = new DtoUserLite();
                BeanUtils.copyProperties(load.getYukSahibi(), userLite);
                dtoLoad.setYukSahibi(userLite);
            }

            if (load.getKalkisAdresi() != null) {
                dtoLoad.setKalkisAdresiId(load.getKalkisAdresi().getId());
                DtoLocationLite kalkisLite = new DtoLocationLite();
                BeanUtils.copyProperties(load.getKalkisAdresi(), kalkisLite);
                dtoLoad.setKalkisAdresi(kalkisLite);
            }

            if (load.getVarisAdresi() != null) {
                dtoLoad.setVarisAdresiId(load.getVarisAdresi().getId());
                DtoLocationLite varisLite = new DtoLocationLite();
                BeanUtils.copyProperties(load.getVarisAdresi(), varisLite);
                dtoLoad.setVarisAdresi(varisLite);
            }
            
            if (load.getTeklifler() != null && !load.getTeklifler().isEmpty()) {
                List<DtoOfferLite> offerList = new ArrayList<>();
                for (Offer offer : load.getTeklifler()) {
                    DtoOfferLite lite = new DtoOfferLite();
                    BeanUtils.copyProperties(offer, lite);
                    lite.setYukId(offer.getYuk().getId()); 
                    offerList.add(lite);
                }
                dtoLoad.setTeklifler(offerList);
            }
            
            if (load.getDokumentler() != null && !load.getDokumentler().isEmpty()) {
                List<DtoDocumentLite> docList = new ArrayList<>();
                for (Document doc : load.getDokumentler()) {
                    DtoDocumentLite lite = new DtoDocumentLite();
                    BeanUtils.copyProperties(doc, lite);
                    docList.add(lite);
                }
                dtoLoad.setDokumentler(docList);
            }
            
            dtoList.add(dtoLoad);
        }
        return dtoList;
    }
    
    @Override
    public Optional<DtoLoad> updateLoadStatus(Long loadId, LoadStatus durum, String adminEmail) {

        Optional<Load> optLoad = loadRepository.findById(loadId);
        if (optLoad.isEmpty()) return Optional.empty();

        Load load = optLoad.get();
        load.setDurum(durum);

        Load updated = loadRepository.save(load);

        DtoLoad dto = new DtoLoad();
        BeanUtils.copyProperties(updated, dto);

        if (updated.getYukSahibi() != null) {
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(updated.getYukSahibi(), userLite);
            dto.setYukSahibi(userLite);
        }

        if (updated.getKalkisAdresi() != null) {
            dto.setKalkisAdresiId(updated.getKalkisAdresi().getId());
        }

        if (updated.getVarisAdresi() != null) {
            dto.setVarisAdresiId(updated.getVarisAdresi().getId());
        }

        return Optional.of(dto);
    }

    @Override
    @Transactional
    public Optional<DtoLoad> updateLoadStatusdriver(
            Long loadId,
            LoadStatus durum,
            String driverEmail
    ) {

        User driver = checkActiveDriver(driverEmail);

        Load load = loadRepository.findById(loadId)
                .orElseThrow(() -> new RuntimeException("Yük bulunamadı"));

        // 🔐 Bu yük bu sürücüye ait mi?
        boolean yetkiliMi = load.getTeklifler().stream()
                .anyMatch(o ->
                    o.getTasiyici().getId().equals(driver.getId()) &&
                    o.getDurum() == OfferStatus.KABUL_EDILDI
                );

        if (!yetkiliMi) {
            throw new RuntimeException("Bu yük üzerinde işlem yetkiniz yok");
        }

        load.setDurum(durum);
        Load updated = loadRepository.save(load);
        if (durum == LoadStatus.YOLDA) {
            notificationService.createNotification(
                load.getYukSahibi().getId(),
                "🚀 Müjde! #" + loadId + " nolu yükünüz yola çıktı. Sürücü: " + driver.getAd() + " " + driver.getSoyad(),
                loadId, 
                "/shipper/active-loads" // Yük sahibinin takip edebileceği sayfa
            );
            System.out.println("🔔 [BİLDİRİM] Yük sahibi bilgilendirildi: Yük yolda!");
        }

        return Optional.of(convertToFullDto(updated));
    }


    @Override
    public Optional<DtoLoad> getLoadId(Long id) {
        Optional<Load> optional = loadRepository.findById(id);
        
        if (optional.isPresent()) {
            Load dbLoad = optional.get();
            
            DtoLoad dtoLoad = new DtoLoad();
            BeanUtils.copyProperties(dbLoad, dtoLoad);
            
            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(dbLoad.getYukSahibi(), userLite);
            dtoLoad.setYukSahibi(userLite);

            dtoLoad.setKalkisAdresiId(dbLoad.getKalkisAdresi().getId());
            DtoLocationLite kalkisLite = new DtoLocationLite();
            BeanUtils.copyProperties(dbLoad.getKalkisAdresi(), kalkisLite);
            dtoLoad.setKalkisAdresi(kalkisLite);

            dtoLoad.setVarisAdresiId(dbLoad.getVarisAdresi().getId());
            DtoLocationLite varisLite = new DtoLocationLite();
            BeanUtils.copyProperties(dbLoad.getVarisAdresi(), varisLite);
            dtoLoad.setVarisAdresi(varisLite);
            
            if (dbLoad.getTeklifler() != null && !dbLoad.getTeklifler().isEmpty()) {
                List<DtoOfferLite> offerList = new ArrayList<>();
                for (Offer offer : dbLoad.getTeklifler()) {
                    DtoOfferLite lite = new DtoOfferLite();
                    BeanUtils.copyProperties(offer, lite);
                    lite.setYukId(offer.getYuk().getId()); 
                    offerList.add(lite);
                }
                dtoLoad.setTeklifler(offerList);
            }
            
            if (dbLoad.getDokumentler() != null && !dbLoad.getDokumentler().isEmpty()) {
                List<DtoDocumentLite> docList = new ArrayList<>();
                for (Document doc : dbLoad.getDokumentler()) {
                    DtoDocumentLite lite = new DtoDocumentLite();
                    BeanUtils.copyProperties(doc, lite);
                    docList.add(lite);
                }
                dtoLoad.setDokumentler(docList);
            }
            
            return Optional.ofNullable(dtoLoad);
        }
        return Optional.empty();
    }
    @Override
    public Optional<DtoLoad> updateLoad(Long id, DtoLoadIU dtoLoadIU, String kullaniciEmail) {
        Optional<Load> opt = loadRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Load load = opt.get();

        if (!load.getYukSahibi().getEmail().equals(kullaniciEmail)) {
            throw new RuntimeException("Bu yük size ait değil!");
        }

        // Alanları güncelle
        load.setAciklama(dtoLoadIU.getAciklama());
        load.setAgirlikKg(dtoLoadIU.getAgirlikKg());
        load.setHacimM3(dtoLoadIU.getHacimM3());
        load.setTeslimTarihi(dtoLoadIU.getTeslimTarihi());

        if (dtoLoadIU.getKalkisAdresiId() != null) {
            load.setKalkisAdresi(locationService.getLocationEntityById(dtoLoadIU.getKalkisAdresiId()));
        }

        if (dtoLoadIU.getVarisAdresiId() != null) {
            load.setVarisAdresi(locationService.getLocationEntityById(dtoLoadIU.getVarisAdresiId()));
        }

        if (dtoLoadIU.getDurum() != null) {
            load.setDurum(LoadStatus.YAYINDA);
        }
        

        if (dtoLoadIU.getYukTipi() != null) {
            load.setYukTipi(YukTipi.valueOf(dtoLoadIU.getYukTipi().toUpperCase()));
        }

        Load saved = loadRepository.save(load);

        DtoLoad dto = new DtoLoad();
        BeanUtils.copyProperties(saved, dto);

        return Optional.of(dto);
    }


    @Override
    public Optional<DtoLoad> deleteLoadByOwner(Long id, String kullaniciEmail) {
        Optional<Load> optionalLoad = loadRepository.findById(id);

        if (optionalLoad.isPresent()) {
            Load dbLoad = optionalLoad.get();
            
            
            DtoLoad dto = new DtoLoad();
            BeanUtils.copyProperties(dbLoad, dto);

            DtoUserLite userLite = new DtoUserLite();
            BeanUtils.copyProperties(dbLoad.getYukSahibi(), userLite);
            dto.setYukSahibi(userLite);

            dto.setKalkisAdresiId(dbLoad.getKalkisAdresi().getId());
            DtoLocationLite kalkisLite = new DtoLocationLite();
            BeanUtils.copyProperties(dbLoad.getKalkisAdresi(), kalkisLite);
            dto.setKalkisAdresi(kalkisLite);

            dto.setVarisAdresiId(dbLoad.getVarisAdresi().getId());
            DtoLocationLite varisLite = new DtoLocationLite();
            BeanUtils.copyProperties(dbLoad.getVarisAdresi(), varisLite);
            dto.setVarisAdresi(varisLite);
            
         // 🔥 TEKLİFLER
            if (dbLoad.getTeklifler() != null) {
                List<DtoOfferLite> offerList = new ArrayList<>();
                for (Offer offer : dbLoad.getTeklifler()) {
                    DtoOfferLite lite = new DtoOfferLite();
                    BeanUtils.copyProperties(offer, lite);
                    lite.setYukId(offer.getYuk().getId());
                    offerList.add(lite);
                }
                dto.setTeklifler(offerList);
            }

            if (dbLoad.getDokumentler() != null && !dbLoad.getDokumentler().isEmpty()) {
                List<DtoDocumentLite> docList = new ArrayList<>();
                for (Document doc : dbLoad.getDokumentler()) {
                    DtoDocumentLite lite = new DtoDocumentLite();
                    BeanUtils.copyProperties(doc, lite);
                    docList.add(lite);
                }
                dto.setDokumentler(docList);
            }

            loadRepository.delete(dbLoad);
            return Optional.of(dto);
        }
        return Optional.empty();
    }
    
    @Transactional
    public void completeLoad(Long loadId, String driverEmail) {

        User driver = checkActiveDriver(driverEmail);

        Load load = loadRepository.findById(loadId)
            .orElseThrow(() -> new RuntimeException("Yük bulunamadı"));

        boolean yetkiliMi = load.getTeklifler().stream()
            .anyMatch(o ->
                o.getTasiyici().getId().equals(driver.getId()) &&
                o.getDurum() == OfferStatus.KABUL_EDILDI
            );

        if (!yetkiliMi) {
            throw new RuntimeException("Bu yükü tamamlama yetkiniz yok");
        }

        load.setDurum(LoadStatus.TESLIM_EDILDI);
        loadRepository.save(load);

        if (load.getYukSahibi() != null) {
            notificationService.createNotification(
                load.getYukSahibi().getId(),
                "📦 #" + loadId + " nolu yük teslim edildi",
                loadId,
                "/shipper/completed-loads"
            );
        }
    }


    public Load getLoadEntityById(Long id) {
        return loadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ID'si " + id + " olan yük bulunamadı."));
    }

    public void saveLoadEntity(Load yuk) {
        loadRepository.save(yuk);
    }


    private DtoLoad convertToFullDto(Load load) {
        DtoLoad dto = new DtoLoad();
        
        BeanUtils.copyProperties(load, dto);

        if (load.getKalkisAdresi() != null) {
            dto.setKalkisAdresiId(load.getKalkisAdresi().getId());
            DtoLocationLite kalkis = new DtoLocationLite();
            BeanUtils.copyProperties(load.getKalkisAdresi(), kalkis);
            dto.setKalkisAdresi(kalkis);
        }
        
        if (load.getVarisAdresi() != null) {
            dto.setVarisAdresiId(load.getVarisAdresi().getId());
            DtoLocationLite varis = new DtoLocationLite();
            BeanUtils.copyProperties(load.getVarisAdresi(), varis);
            dto.setVarisAdresi(varis);
        }

        if (load.getTeklifler() != null) {
            dto.setTeklifSayisi(load.getTeklifler().size());
            
            dto.setTeklifler(load.getTeklifler().stream().map(offer -> {
                DtoOfferLite oDto = new DtoOfferLite();
                BeanUtils.copyProperties(offer, oDto);
                oDto.setYukId(load.getId());
                
                if (offer.getTasiyici() != null) {
                    oDto.setTasiyiciId(offer.getTasiyici().getId()); 
                }

                if (offer.getDurum() != null && 
                   (offer.getDurum().toString().equals("KABUL_EDILDI") || offer.getDurum().toString().equals("TAMAMLANDI"))) {
                    if (offer.getTasiyici() != null) {
                        dto.setTasiyiciId(offer.getTasiyici().getId());
                        
                      
                        
                    }
                    if (load.getDokumentler() != null) {
                        List<DtoDocumentLite> docList = load.getDokumentler().stream().map(doc -> {
                            DtoDocumentLite dDto = new DtoDocumentLite();
                            BeanUtils.copyProperties(doc, dDto);
                            return dDto;
                        }).collect(Collectors.toList());
                        dto.setDokumentler(docList);
                    }
                  
                }
                if (load.getDokumentler() != null && !load.getDokumentler().isEmpty()) {
                    List<DtoDocumentLite> docList = new ArrayList<>();
                    for (Document doc : load.getDokumentler()) {
                        DtoDocumentLite dLite = new DtoDocumentLite();
                        BeanUtils.copyProperties(doc, dLite);
                        docList.add(dLite);
                    }
                    dto.setDokumentler(docList);
                } else {
                    dto.setDokumentler(new ArrayList<>()); // Null yerine boş liste dönmek güvenlidir
                }
                
                return oDto;
            }).collect(Collectors.toList()));
        }
        


        if (load.getYukSahibi() != null) {
            DtoUserLite userDto = new DtoUserLite();
            BeanUtils.copyProperties(load.getYukSahibi(), userDto);
            dto.setYukSahibi(userDto);
        }

        return dto;
    }

    @Override
    public List<DtoLoad> getShipperCompletedLoads(String ownerEmail) {
        List<Load> completedLoads = loadRepository.findByYukSahibi_EmailAndDurum(ownerEmail, LoadStatus.TESLIM_EDILDI);
        
        return completedLoads.stream()
                .map(this::convertToFullDto)
                .collect(Collectors.toList());
        
        
        
    }

    
}