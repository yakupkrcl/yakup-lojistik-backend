package com.yakupProje.controller; 

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.yakupProje.dto.DtoOffer;
import com.yakupProje.dto.DtoOfferIU;
import com.yakupProje.dto.DtoOfferLite;
import com.yakupProje.enums.OfferStatus;
import com.yakupProje.services.IOfferService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})@RestController
@RequestMapping("/rest/v1/offers")
public class OfferController {

    private final IOfferService offerService;

    public OfferController(IOfferService offerService) {
        this.offerService = offerService;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            System.out.println("❌ HATA: Kullanıcı kimliği doğrulanmadı (Context boş)!");
            throw new RuntimeException("Yetkisiz erişim!");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST) // ❗ 400
            .body(Map.of("message", ex.getMessage()));
    }

    
    /* =======================
       DRIVER
       ======================= */

    @PostMapping("/driver/save")
    public ResponseEntity<DtoOffer> saveOfferByDriver(@RequestBody DtoOfferIU dtoOfferIU) {
    	
    	System.out.println(">>> SAVE İSTEĞİ GELDİ!");
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(">>> AUTH NESNESİ: " + auth);
    	
        String driverEmail = getCurrentUserEmail();
        DtoOffer savedOffer = offerService.saveOfferByDriver(dtoOfferIU, driverEmail);
        return new ResponseEntity<>(savedOffer, HttpStatus.CREATED);
    }

    @GetMapping("/driver/my-offers")
    public ResponseEntity<List<DtoOffer>> getMyOffers() {
        String driverEmail = getCurrentUserEmail();
        List<DtoOffer> offers = offerService.getOffersByDriver(driverEmail);
        return new ResponseEntity<>(offers, HttpStatus.OK);
    }
    
 // OfferController.java içinde bul ve değiştir
    @PutMapping("/driver/complete/{offerId}")
    public ResponseEntity<?> completeOffer(@PathVariable Long offerId) {
        try {
            offerService.completeOfferByDriver(offerId);
            return ResponseEntity.ok(Map.of("message", "Yük başarıyla tamamlandı", "status", "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Tamamlama sırasında hata: " + e.getMessage()));
        }
    }

    @PutMapping("/driver/start-journey/{offerId}")
    public ResponseEntity<?> startJourney(@PathVariable Long offerId) { // DtoOfferLite yerine ? yaptık
        try {
            DtoOfferLite result = offerService.startJourney(offerId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            // Hata mesajını JSON olarak gönderiyoruz
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Sunucu hatası: " + e.getMessage()));
        }
    }
    

    /* =======================
       ADMIN
       ======================= */

    @GetMapping("/list")
    public ResponseEntity<List<DtoOffer>> getAllOffersForAdmin() {
        List<DtoOffer> offers = offerService.getAllOffers();
        return new ResponseEntity<>(offers, HttpStatus.OK);
    }

    /* =======================
       GENEL
       ======================= */

    @GetMapping("/{id}")
    public ResponseEntity<DtoOffer> getOfferById(@PathVariable Long id) {
        DtoOffer offer = offerService.getOfferById(id);
        return new ResponseEntity<>(offer, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DtoOffer> deleteOffer(@PathVariable Long id) {
        DtoOffer deletedOffer = offerService.deleteOffer(id);
        return new ResponseEntity<>(deletedOffer, HttpStatus.OK);
    }

    /* =======================
       SHIPPER
       ======================= */
    /* =======================
    SHIPPER
    ======================= */

    @PutMapping("/shipper/accept/{offerId}")
    public ResponseEntity<?> acceptOffer(
        @PathVariable Long offerId,
        @RequestBody(required = false) Map<String, String> payload
    ) {
        try {
            String shipperEmail = getCurrentUserEmail();
            
            // 🚩 ÖNEMLİ: Frontend'den hangi isimle geliyorsa onu kontrol et
            // Biz genellikle 'paymentMethod' veya 'odemeYontemi' kullanırız
            String odemeYontemi = "CUZDAN"; // Varsayılanı projenin ana mantığına göre setle
            
            if (payload != null) {
                if (payload.containsKey("odemeYontemi")) {
                    odemeYontemi = payload.get("odemeYontemi");
                } else if (payload.containsKey("odeme_yontemi")) {
                    odemeYontemi = payload.get("odeme_yontemi");
                }
            }

            DtoOffer acceptedOffer = offerService.updateOfferStatusByShipper(
                    offerId,
                    shipperEmail,
                    OfferStatus.KABUL_EDILDI,
                    odemeYontemi
            );
            return ResponseEntity.ok(acceptedOffer);
        } catch (Exception e) { // RuntimeException yerine genel Exception daha güvenli
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    
    
    @GetMapping("/load/{loadId}") 
    public ResponseEntity<List<DtoOffer>> getOffersByLoad(@PathVariable Long loadId) {
    List<DtoOffer> offers = offerService.getOffersByLoadIdDto(loadId); 
        return ResponseEntity.ok(offers);
    }

    @PutMapping("/shipper/reject/{offerId}")
    public ResponseEntity<DtoOffer> rejectOffer(@PathVariable Long offerId) {
        String shipperEmail = getCurrentUserEmail();
        DtoOffer rejectedOffer = offerService.updateOfferStatusByShipper(
                offerId,
                shipperEmail,
                OfferStatus.REDDEDILDI,
                null
                
        );
        return new ResponseEntity<>(rejectedOffer, HttpStatus.OK);
    }
}
