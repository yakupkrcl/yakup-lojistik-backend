package com.yakupProje.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.yakupProje.dto.DtoRating;
import com.yakupProje.dto.DtoRatingIU;
import com.yakupProje.entity.Load;
import com.yakupProje.entity.Rating;
import com.yakupProje.entity.User;
import com.yakupProje.repository.RatingRepository;

import jakarta.transaction.Transactional;

@Service
public class RatingService implements IRatingService {

	private final LoadService loadService;
	
	private final NotificationService notificationService;

	private final UserService userService;

	private RatingRepository ratingRepository;

	public RatingService(RatingRepository ratingRepository, UserService userService,NotificationService notificationService, LoadService loadService) {
		this.ratingRepository = ratingRepository;
		this.userService = userService;
		this.loadService = loadService;
		this.notificationService=notificationService;
	}

	@Override
	@Transactional
	public DtoRating saveRating(DtoRatingIU dtoRatingIU) {
	    User puanlananUser = userService.getUserEntityById(dtoRatingIU.getPuanlananKullaniciId());
	    User puanlayanUser = userService.getUserEntityById(dtoRatingIU.getPuanlayanKullaniciId());
	    Load yuk = loadService.getLoadEntityById(dtoRatingIU.getYukId());

	    if (ratingRepository.existsByYukIdAndPuanlayanKullaniciId(dtoRatingIU.getYukId(), dtoRatingIU.getPuanlayanKullaniciId())) {
	        throw new RuntimeException("Bu yük için zaten puan verilmiş.");
	    }

	    // 1. Rating Kaydı
	    Rating rating = new Rating();
	    BeanUtils.copyProperties(dtoRatingIU, rating);
	    rating.setPuanlayanKullanici(puanlayanUser);
	    rating.setPuanlananKullanici(puanlananUser);
	    rating.setYuk(yuk);
	    rating.setYorum(dtoRatingIU.getYorum());
	    ratingRepository.save(rating);

	    // 2. Ortalama Güncelleme
	    List<Rating> allRatings = ratingRepository.findByPuanlananKullaniciId(puanlananUser.getId());
	    double average = allRatings.stream().mapToDouble(Rating::getPuan).average().orElse(0.0);
	    puanlananUser.setAverageRating(average);
	    userService.saveUserEntity(puanlananUser); 

	    // 3. DTO Hazırlama
	    DtoRating dto = new DtoRating();
	    BeanUtils.copyProperties(rating, dto);
	    dto.setYukId(yuk.getId());
	    dto.setPuanlananKullaniciId(puanlananUser.getId());
	    dto.setPuanlayanKullaniciId(puanlayanUser.getId());
	    dto.setPuanlayanAd(puanlananUser.getAd());
	    dto.setPuanlayanSoyad(puanlananUser.getSoyad());

	    // 4. Akıllı Bildirimler
	    try {
	        // YÜK SAHİBİNE: Onay mesajı
	        notificationService.createNotification(
	            puanlayanUser.getId(), 
	            "#" + yuk.getId() + " nolu yük için yaptığınız değerlendirme kaydedildi.",
	            yuk.getId(),
	            "/shipper/completed-loads"
	        );

	        System.out.println("Bildirim Gönderiliyor - Alıcı (Şoför) ID: " + puanlananUser.getId());
	        System.out.println("Bildirim Gönderiliyor - Alıcı (Yük Sahibi) ID: " + puanlayanUser.getId());
	        String driverMessage = String.format("Tebrikler! %s, #%d nolu taşımanız için size %d yıldız verdi.", 
	                                              puanlayanUser.getAd(), yuk.getId(), rating.getPuan());
	        
	        System.out.println("Bildirim Gönderiliyor - Alıcı (Şoför) ID: " + puanlananUser.getId());
	        System.out.println("Bildirim Gönderiliyor - Alıcı (Yük Sahibi) ID: " + puanlayanUser.getId());
	        notificationService.createNotification(
	            puanlananUser.getId(), 
	            driverMessage,
	            yuk.getId(),
	            "/driver/profile"
	        );
	    } catch (Exception e) {
	        // Bildirim gitmezse puanlama iptal olmasın, sadece hatayı logla
	        System.err.println("Puanlama bildirimi gönderilirken hata oluştu: " + e.getMessage());
	    }
	    
	    return dto;
	}
	
	@Override
	public List<DtoRating> getAllRatings() {
	    List<Rating> dbRatings = ratingRepository.findAll();
	    List<DtoRating> dtoRatings = new ArrayList<>();
	    
	    for (Rating rating : dbRatings) {
	        DtoRating dto = new DtoRating();
	        // 1. Temel alanları kopyala (id, puan, yorum, olusturulmaTarihi)
	        BeanUtils.copyProperties(rating, dto);
	        
	        // 2. İlişkili ID'leri manuel olarak Entity'den çekip DTO'ya koy
	        if (rating.getPuanlananKullanici() != null) {
	            dto.setPuanlananKullaniciId(rating.getPuanlananKullanici().getId());
	        }
	        
	        if (rating.getPuanlayanKullanici() != null) {
	            dto.setPuanlayanKullaniciId(rating.getPuanlayanKullanici().getId());
	            // ÖNEMLİ: Eğer DTO'nda bu alanlar varsa isimleri de gönderelim
	            dto.setPuanlayanAd(rating.getPuanlayanKullanici().getAd());
	            dto.setPuanlayanSoyad(rating.getPuanlayanKullanici().getSoyad());
	        }
	        
	        if (rating.getYuk() != null) {
	            dto.setYukId(rating.getYuk().getId());
	        }
	        
	        dtoRatings.add(dto);
	    }
	    
	    return dtoRatings;
	}

	@Override
	public DtoRating getRatingById(Long id) {
	    try {
	        Rating dbRating = ratingRepository.findById(id).orElse(null);
	        if (dbRating == null) {
	            return new DtoRating(); // Boş DTO dön, hata fırlatma
	        }
	        DtoRating dto = new DtoRating();
	        BeanUtils.copyProperties(dbRating, dto);
	        return dto;
	    } catch (Exception e) {
	        return new DtoRating();
	    }
	}
	@Override
	public DtoRating updateRating(Long id, DtoRatingIU dtoRatingIU) {
		Rating dbOptional=this.getRatingEntityById(id);
	
		
		dbOptional.setPuan(dtoRatingIU.getPuan());
		dbOptional.setYorum(dtoRatingIU.getYorum());
	
			Rating dbRating2=ratingRepository.save(dbOptional);
			
			DtoRating dto=new DtoRating();
			BeanUtils.copyProperties(dbRating2, dto);
			
			return dto;
		}
			
	

	@Override
	public DtoRating deleteRating(Long id) {
		Rating dbOptional=this.getRatingEntityById(id);
		
		
			ratingRepository.delete(dbOptional);
		 
			
			DtoRating dto=new DtoRating();
			BeanUtils.copyProperties(dbOptional, dto);
			
			   notificationService.createNotification(
		                dto.getPuanlananKullaniciId(),
		                "#" + dto.getYukId() + " nolu yük için yaptığınız degerlendırme  sililindi.",
		                dto.getYukId(),"/"
		        );
			
			return dto;
		}


	public Rating getRatingEntityById(Long id) {
		return ratingRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("ID'si " + id + " olan rating bulunamadı."));
	}

}
