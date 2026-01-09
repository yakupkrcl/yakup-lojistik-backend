package com.yakupProje.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.yakupProje.dto.*;
import com.yakupProje.entity.Load;
import com.yakupProje.entity.Offer;
import com.yakupProje.entity.Transaction;
import com.yakupProje.entity.User;
import com.yakupProje.enums.LoadStatus;
import com.yakupProje.enums.OfferStatus;
import com.yakupProje.enums.TransactionStatus;
import com.yakupProje.repository.LoadRepository;
import com.yakupProje.repository.OfferRepository;
import com.yakupProje.repository.TransactionRepository;
import com.yakupProje.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class OfferService implements IOfferService {


    private final UserRepository userRepository;
	private final NotificationService notificationService;
	private final UserService userService;
    private final LoadService loadService;
    private final OfferRepository offerRepository;
    private final TransactionRepository transactionRepository;
    private final LoadRepository loadRepository;

    public OfferService(
    		UserRepository userRepository,
            OfferRepository offerRepository,
            UserService userService,
            LoadService loadService,
            LoadRepository loadRepository,
            NotificationService notificationService,
            TransactionRepository transactionRepository
            ) {

        this.offerRepository = offerRepository;
        this.userService = userService;
        this.userRepository=userRepository;
        this.loadService = loadService;
        this.loadRepository = loadRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService=notificationService;
    }

 

    
    


    
    public List<DtoOffer> getOffersByLoadIdDto(Long loadId) {
        List<Offer> offers = offerRepository.findByYuk_Id(loadId);
        List<DtoOffer> dtoList = new ArrayList<>();
        for (Offer offer : offers) {
            dtoList.add(convertToDto(offer)); 
        }
        return dtoList;
    }
    @Override
    @Transactional
    public DtoOffer saveOfferByDriver(DtoOfferIU dtoOfferIU, String driverEmail) {
        User tasiyici = userService.getUserEntityByEmail(driverEmail);
        
        if (!tasiyici.isAktif()) {
            throw new IllegalStateException(
                "Belgeleriniz henüz admin tarafından onaylanmadı. Teklif veremezsiniz."
            );
        }

        
        Load yuk = loadService.getLoadEntityById(dtoOfferIU.getYukId());

        // Güvenlik: Zaten kabul edilmiş veya yoldaki yüke teklif verilemez
        if (yuk.getDurum() != LoadStatus.YAYINDA && yuk.getDurum() != LoadStatus.TEKLIF_ALDI) {
            throw new IllegalArgumentException("Bu yüke artık teklif verilemez.");
        }

        if (offerRepository.existsByYukIdAndTasiyiciId(yuk.getId(), tasiyici.getId())) {
            throw new IllegalArgumentException("Bu yüke daha önce teklif verdiniz.");
        }

        
        
        Offer offer = new Offer();
        offer.setTeklifFiyati(dtoOfferIU.getTeklifFiyati());
        offer.setDurum(OfferStatus.BEKLEMEDE);
        offer.setTasiyici(tasiyici);
        offer.setYuk(yuk);
        offer.setNote(dtoOfferIU.getNote());
        offer.setGecerlilikTarihi(LocalDateTime.now().plusDays(2));

        // Yükün durumunu sadece ilk teklifte güncelle
        if (yuk.getDurum() == LoadStatus.YAYINDA) {
            yuk.setDurum(LoadStatus.TEKLIF_ALDI);
            loadRepository.save(yuk);
        }
        Offer savedOffer = offerRepository.save(offer);

        try {
        	notificationService.createNotification(
        		    yuk.getYukSahibi().getId(), 
        		    "İlanınıza yeni bir teklif geldi: " + dtoOfferIU.getTeklifFiyati() + " TL", 
        		    yuk.getId(),
        		    "/shipper/manage-offers/" + yuk.getId() 
        		);
        } catch (Exception e) {
            System.err.println("Bildirim gönderilemedi ama teklif kaydedildi: " + e.getMessage());
        }

        return convertToDto(savedOffer);
    }

    @Override
    public List<DtoOffer> getOffersByDriver(String driverEmail) {
        User tasiyici = userService.getUserEntityByEmail(driverEmail);
        List<Offer> offers = offerRepository.findByTasiyici_Id(tasiyici.getId());

        List<DtoOffer> dtoList = new ArrayList<>();
        for (Offer offer : offers) {
            dtoList.add(convertToDto(offer));
        }
        return dtoList;
    }


    @Override
    public List<DtoOffer> getAllOffers() {
        List<Offer> offers = offerRepository.findAll();
        List<DtoOffer> dtoList = new ArrayList<>();

        for (Offer offer : offers) {
            dtoList.add(convertToDto(offer));
        }
        return dtoList;
    }



    @Override
    public DtoOffer getOfferById(Long id) {
        Offer offer = getOfferEntityById(id);
        return convertToDto(offer);
    }

    @Override
    public DtoOffer deleteOffer(Long id) {
        Offer offer = getOfferEntityById(id);
        offerRepository.delete(offer);
        return convertToDto(offer);
    }


    public Offer getOfferEntityById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teklif bulunamadı: " + id));
    }

    public void rejectOtherOffersForLoad(Long loadId, Long acceptedOfferId) {
        List<Offer> offers = offerRepository.findByYukIdAndDurum(loadId, OfferStatus.BEKLEMEDE);
        for (Offer offer : offers) {
            if (!offer.getId().equals(acceptedOfferId)) {
                offer.setDurum(OfferStatus.REDDEDILDI);
                offerRepository.save(offer);
                
                notificationService.createNotification(
                    offer.getTasiyici().getId(),
                    "İlgilendiğiniz #" + loadId + " nolu yük için  teklif reddedildi.",
                    loadId,"/driver/my-offers"
                );
            }
        }
    }

    private DtoOffer convertToDto(Offer offer) {
        DtoOffer dto = new DtoOffer();
        BeanUtils.copyProperties(offer, dto);
        dto.setNote(offer.getNote());
        dto.setOdemeYontemi(offer.getOdemeYontemi());

        if (offer.getTasiyici() != null) {
            dto.setTasiyiciId(offer.getTasiyici().getId());
            DtoUserLite tasiyiciLite = new DtoUserLite();
            BeanUtils.copyProperties(offer.getTasiyici(), tasiyiciLite);
            tasiyiciLite.setRating(offer.getTasiyici().getAverageRating());
            
            dto.setTasiyici(tasiyiciLite);
        }

        if (offer.getYuk() != null) {
            dto.setYukId(offer.getYuk().getId());
            
            DtoLoad loadDto = new DtoLoad(); 
            BeanUtils.copyProperties(offer.getYuk(), loadDto);
         // convertToDto metodu içinde Load kısmına bunu ekle
            loadDto.setDeliveryCode(offer.getYuk().getDeliveryCode());

            if (offer.getYuk().getKalkisAdresi() != null) {
                DtoLocationLite kalkis = new DtoLocationLite();
                BeanUtils.copyProperties(offer.getYuk().getKalkisAdresi(), kalkis);
                loadDto.setKalkisAdresi(kalkis); //
            }

            if (offer.getYuk().getVarisAdresi() != null) {
                DtoLocationLite varis = new DtoLocationLite();
                BeanUtils.copyProperties(offer.getYuk().getVarisAdresi(), varis);
                loadDto.setVarisAdresi(varis); //
            }

            dto.setYuk(loadDto); 
        }
        dto.setDurum(offer.getDurum());

        return dto;
    }
    @Override
    @Transactional
    public DtoOffer updateOfferStatusByShipper(Long offerId, String shipperEmail, OfferStatus newStatus, String odemeYontemi) {
        Offer offer = getOfferEntityById(offerId);
        Load load = offer.getYuk();

        if (newStatus == OfferStatus.KABUL_EDILDI) {
            if (load.getDurum() == LoadStatus.TEKLIF_KABUL_EDILDI) {
                throw new IllegalArgumentException("Bu yük için zaten bir teklif kabul edilmiş.");
            }

            User shipper = userService.getUserEntityByEmail(shipperEmail);
            Double tutar = offer.getTeklifFiyati();

            // 🚩 ÖDEME YÖNTEMİNİ SETLE (NULL KALMASIN)
            offer.setOdemeYontemi(odemeYontemi); 

            if ("CUZDAN".equalsIgnoreCase(odemeYontemi)) {
                if (shipper.getBalance() < tutar) {
                    throw new IllegalArgumentException("Yetersiz bakiye!");
                }
                shipper.setBalance(shipper.getBalance() - tutar);
                userRepository.save(shipper);
            }
            

            // 🚩 KOMİSYON HESABI (Örn: %10 ise 0.10 yap)
            double komisyonOrani = 0.10; 
            double komisyonTutari = tutar * komisyonOrani;
            double soforKazanci = tutar - komisyonTutari;

            String generatedCode = String.valueOf((int)((Math.random() * 900000) + 100000));
            load.setDeliveryCode(generatedCode);

            // 1. ŞOFÖRE GİDEN BİLDİRİM (Kod GÖNDERİLMİYOR, sadece bilgi veriliyor)
            notificationService.createNotification(
                offer.getTasiyici().getId(),
                "Yük onaylandı! Yükü teslim ettiğinizde yük sahibinden onay kodunu almayı unutmayın.",
                load.getId(), 
                "/driver/active-loads" // Koda direkt gitmesin, aktif yüklerine gitsin
            );

            // 2. YÜK SAHİBİNE GİDEN BİLDİRİM (Kod sadece burada kalıyor)
            notificationService.createNotification(
                shipper.getId(),
                "Ödemeniz alındı. #" + load.getId() + " nolu yük için şoföre vermeniz gereken kod: " + generatedCode,
                load.getId(),
                "/shipper/my-loads" 
            );
            offer.setDurum(OfferStatus.KABUL_EDILDI);
            load.setDurum(LoadStatus.TEKLIF_KABUL_EDILDI);
            loadRepository.save(load); 
            
            rejectOtherOffersForLoad(load.getId(), offerId);

            Transaction tx = new Transaction();
            tx.setYuk(load);
            tx.setTeklif(offer);
            tx.setMiktar(tutar);
            tx.setKomisyonTutari(komisyonTutari); // Eğer Transaction entity'de alanın varsa
            tx.setOdemeYontemi(odemeYontemi); // 🚩 NULL KALMAMASI İÇİN BURAYA DA EKLE
            tx.setTasiyici(offer.getTasiyici());
            tx.setYukSahibi(shipper);
            tx.setDurum(TransactionStatus.BEKLEMEDE);
            tx.setOlusturulmaTarihi(LocalDateTime.now());
            tx.setReferansKodu("REF-" + System.currentTimeMillis());
            transactionRepository.save(tx);
        }
        else if (newStatus == OfferStatus.REDDEDILDI) {
            offer.setDurum(OfferStatus.REDDEDILDI);
            
            // 🚩 BURASI EKLENDİ: Yükün diğer tekliflerini kontrol et
            Load loadToUpdate = offer.getYuk();
            
            // Yükte hala bekleyen (BEKLEMEDE) başka teklif var mı?
            boolean baskaTeklifVarMi = offerRepository.findByYukIdAndDurum(loadToUpdate.getId(), OfferStatus.BEKLEMEDE)
                    .stream()
                    .anyMatch(o -> !o.getId().equals(offerId));

            if (!baskaTeklifVarMi) {
                // Eğer reddedilen bu teklif son "bekleyen" teklif id ise, 
                // yükün durumunu tekrar "YAYINDA"ya çek ki Admin/Shipper "Teklif Bekliyor" sanmasın.
                loadToUpdate.setDurum(LoadStatus.YAYINDA);
                loadRepository.save(loadToUpdate);
            }
            
            // Şoföre "Teklifin reddedildi" bildirimi gönder
            notificationService.createNotification(
                offer.getTasiyici().getId(),
                "#" + loadToUpdate.getId() + " nolu yük için verdiğiniz teklif reddedildi.",
                loadToUpdate.getId(),
                "/driver/my-offers"
            );
        }

        return convertToDto(offerRepository.save(offer));
    }
    @Override
    @Transactional
    public DtoOfferLite startJourney(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Teklif bulunamadı!"));
        User tasiyici = offer.getTasiyici();
        if (!tasiyici.isAktif()) {
            throw new IllegalStateException(
                "Belgeleriniz onaylı değil. Yolculuk başlatamazsınız."
            );
        }


        // 1. Teklifin durumunu güncelle (Frontend'de tabloda doğru görünmesi için)
        offer.setDurum(OfferStatus.KABUL_EDILDI); // Zaten böyleydi ama emin olalım
        
        if (offer.getYuk() != null) {
            Load yuk = offer.getYuk();
            // 2. Yükün durumunu YOLDA yap
            yuk.setDurum(LoadStatus.YOLDA);
            
            
            loadRepository.save(yuk);
        }
        
        Offer savedOffer = offerRepository.save(offer);
        return convertToLiteDto(savedOffer);
    }
    private DtoOfferLite convertToLiteDto(Offer offer) {
        DtoOfferLite dto = new DtoOfferLite();
        dto.setId(offer.getId());
        dto.setTeklifFiyati(offer.getTeklifFiyati());
        dto.setDurum(offer.getDurum());
        dto.setNote(offer.getNote());
        dto.setGecerlilikTarihi(offer.getGecerlilikTarihi());
        
        if (offer.getTasiyici() != null) {
            dto.setTasiyiciId(offer.getTasiyici().getId());
        }
        
        if (offer.getYuk() != null) {
            dto.setYukId(offer.getYuk().getId());
        }
        
      
        
        return dto;
    }
    
    




    @Override
    @Transactional
    public void completeOfferByDriver(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new RuntimeException("Teklif bulunamadı: " + offerId));

        // 1. Durum Güncellemeleri
        offer.setDurum(OfferStatus.TAMAMLANDI); 
        Load yuk = offer.getYuk();
        if (yuk != null) {
            yuk.setDurum(LoadStatus.TESLIM_EDILDI);
            loadRepository.save(yuk);
        }

        Double toplamTutar = offer.getTeklifFiyati();
        double komisyonOrani = 0.10; // %10 komisyon
        double netKazanc = toplamTutar * (1 - komisyonOrani);

        User tasiyici = offer.getTasiyici();
        tasiyici.setBalance(tasiyici.getBalance() + netKazanc); // Şoföre komisyon düşülmüş hali gider
        userRepository.save(tasiyici);

        // 3. Transaction Güncelleme
        transactionRepository.findByTeklif_Id(offerId).ifPresent(tx -> {
            tx.setDurum(TransactionStatus.TAMAMLANDI);
            tx.setOlusturulmaTarihi(LocalDateTime.now());
            transactionRepository.saveAndFlush(tx);
        });

        // 4. Bildirim
        notificationService.createNotification(
                yuk.getYukSahibi().getId(),
                "Yükünüz teslim edildi ve ödeme tamamlandı. #" + yuk.getId(),
                yuk.getId(), "/shipper/completed-loads"
            );
        
        offerRepository.save(offer);
    }
}
