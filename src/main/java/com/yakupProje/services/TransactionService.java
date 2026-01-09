package com.yakupProje.services;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.BeanUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import com.yakupProje.dto.DtoOfferLite; 
import com.yakupProje.dto.DtoTransaction;
import com.yakupProje.dto.DtoTransactionIU;
import com.yakupProje.dto.DtoUserLite; 
import com.yakupProje.entity.Offer;
import com.yakupProje.entity.Transaction;
import com.yakupProje.entity.User;
import com.yakupProje.enums.TransactionStatus;
import com.yakupProje.repository.TransactionRepository;

@Service
public class TransactionService implements ITransactionService{

	private static final double KOMISYON_ORANI = 0.05;
	
	private final TransactionRepository transactionRepository;
	private final UserService userService;
	private final OfferService offerService;
	

    public TransactionService(TransactionRepository transactionRepository, UserService userService, OfferService offerService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.offerService = offerService;
    }
    @Transactional
    public void updateTransactionToCompleted(Long offerId) {
        // Teklife bağlı transaction'ı buluyoruz
    	Transaction tx = transactionRepository.findByTeklif_Id(offerId)
            .orElseThrow(() -> new RuntimeException("Bu teklife ait finansal işlem bulunamadı."));
        
        // Durumu TAMAMLANDI yapıyoruz
        tx.setDurum(TransactionStatus.TAMAMLANDI);
        
        // Eğer tarih null geliyorsa burada garantiye alalım
        if (tx.getOlusturulmaTarihi() == null) {
            tx.setOlusturulmaTarihi(java.time.LocalDateTime.now());
        }
        
        transactionRepository.save(tx);
    }
    
    @Transactional
    public void completeTransactionStatus(Long offerId) {
        // Teklif ID üzerinden doğru transaction'ı buluyoruz
        Transaction tx = transactionRepository.findByTeklif_Id(offerId)
            .orElseThrow(() -> new RuntimeException("Bu teklife ait işlem kaydı bulunamadı. Offer ID: " + offerId));
        
        tx.setDurum(TransactionStatus.TAMAMLANDI);
        
        // Teslimat anını tarih olarak kaydediyoruz
        tx.setOlusturulmaTarihi(java.time.LocalDateTime.now());
        
        // saveAndFlush kullanarak değişikliği anında DB'ye zorluyoruz
        transactionRepository.saveAndFlush(tx);
    }
    private DtoTransaction convertEntityToDto(Transaction dbTransaction) {
		DtoTransaction dtoTransaction = new DtoTransaction();
		BeanUtils.copyProperties(dbTransaction, dtoTransaction);
		
		
		dtoTransaction.setNot(dbTransaction.getNot());
		
		if (dbTransaction.getTeklif() != null) {
            dtoTransaction.setTeklifId(dbTransaction.getTeklif().getId());
            DtoOfferLite offerLite = new DtoOfferLite();
            BeanUtils.copyProperties(dbTransaction.getTeklif(), offerLite);
            
            if (dbTransaction.getTeklif().getYuk() != null) {
                offerLite.setYukId(dbTransaction.getTeklif().getYuk().getId());
            }
            if (dbTransaction.getTeklif().getTasiyici() != null) {
                offerLite.setTasiyiciId(dbTransaction.getTeklif().getTasiyici().getId());
            }
            dtoTransaction.setTeklif(offerLite);
        }
        
        
        if (dbTransaction.getYukSahibi() != null) {
            dtoTransaction.setYukSahibiId(dbTransaction.getYukSahibi().getId());
            DtoUserLite yukSahibiLite = new DtoUserLite();
            BeanUtils.copyProperties(dbTransaction.getYukSahibi(), yukSahibiLite);
            dtoTransaction.setYukSahibi(yukSahibiLite);
        }

      
        if (dbTransaction.getTasiyici() != null) {
            dtoTransaction.setTasiyiciId(dbTransaction.getTasiyici().getId());
            DtoUserLite tasiyiciLite = new DtoUserLite();
            BeanUtils.copyProperties(dbTransaction.getTasiyici(), tasiyiciLite);
            dtoTransaction.setTasiyici(tasiyiciLite);
        }
        
    
        if (dbTransaction.getDurum() != null) {
            dtoTransaction.setDurum(dbTransaction.getDurum()); 
        }
        
        return dtoTransaction;
    }
    


    public List<DtoTransaction> getAllTransactionsAdmin() {
        List<Transaction> transactions = transactionRepository.findAll();
        List<DtoTransaction> dtoList = new ArrayList<>();
        
        for (Transaction tx : transactions) {
            DtoTransaction dto = new DtoTransaction();
            BeanUtils.copyProperties(tx, dto);
            
            // 🚩 KOMİSYON BURADA EKSİKTİ:
            if (tx.getKomisyonTutari() != null) {
                // Altı çizilen yeri DTO'ndaki isme göre şöyle değiştir:
                dto.setKomisyonTutari(tx.getKomisyonTutari()); 
            } else if (tx.getMiktar() != null) {
                // Eğer DB boşsa anlık hesapla ve yine DTO'ya setle
                dto.setKomisyonTutari(tx.getMiktar() * 0.05); 
            }
            // Tarih ve Durum atamaları
            dto.setOlusturulmaTarihi(tx.getOlusturulmaTarihi());
            dto.setDurum(tx.getDurum());
            dto.setNot(tx.getNot());
            
            // Şoför Bilgileri
            if (tx.getTasiyici() != null) {
                dto.setTasiyiciAdSoyad(tx.getTasiyici().getAd() + " " + tx.getTasiyici().getSoyad());
                dto.setTasiyiciEmail(tx.getTasiyici().getEmail());
            }
            
            // Şehir Bilgileri (Yük üzerinden)
            if (tx.getYuk() != null) {
                if (tx.getYuk().getKalkisAdresi() != null) {
                    dto.setKalkisSehri(tx.getYuk().getKalkisAdresi().getSehir());
                }
                if (tx.getYuk().getVarisAdresi() != null) {
                    dto.setVarisSehri(tx.getYuk().getVarisAdresi().getSehir());
                }
                if (tx.getYuk().getYukSahibi() != null) {
                    dto.setYukSahibiEmail(tx.getYuk().getYukSahibi().getEmail());
                    // İsim soyisim de admin panelinde güzel görünür:
                    dto.setYukSahibiAdSoyad(tx.getYuk().getYukSahibi().getAd() + " " + tx.getYuk().getYukSahibi().getSoyad());
                }
            }
            dtoList.add(dto);
        }
        return dtoList;
    }
	@Override
	@Transactional
	public DtoTransaction saveTransaction(DtoTransactionIU dtoTransactionIU) {

		User yukSahıbı = userService.getUserEntityById(dtoTransactionIU.getYukSahibiId());
		User tasıyıcı = userService.getUserEntityById(dtoTransactionIU.getTasiyiciId());
        Offer teklıf = offerService.getOfferEntityById(dtoTransactionIU.getTeklifId());
		
		Transaction transaction = new Transaction();
		BeanUtils.copyProperties(dtoTransactionIU, transaction);
        
        transaction.setDurum(TransactionStatus.valueOf(dtoTransactionIU.getDurum().toUpperCase()));
		
    
		transaction.setTeklif(teklıf);
		transaction.setTasiyici(tasıyıcı);
		transaction.setYukSahibi(yukSahıbı);
		

		double miktar = dtoTransactionIU.getMiktar();
        double komisyon = miktar * KOMISYON_ORANI;
        transaction.setKomisyonTutari(komisyon);
        transaction.setReferansKodu(UUID.randomUUID().toString());
       
        
        Transaction dbTransaction = transactionRepository.save(transaction);
		
		return convertEntityToDto(dbTransaction);
	}


	@Override
	public List<DtoTransaction> getMyTransactions() { // İsmini değiştirdik
	    // 🚩 Giriş yapan kullanıcının emailini token'dan alıyoruz
	    String email = SecurityContextHolder.getContext().getAuthentication().getName();
	    
	    // Sadece bu kullanıcıya ait işlemleri çek
	    List<Transaction> dbTransactions = transactionRepository.findByYukSahibi_Email(email);
	    
	    List<DtoTransaction> dtoTransactions = new ArrayList<>();
	    for (Transaction tx : dbTransactions) {
	        dtoTransactions.add(convertEntityToDto(tx)); // Mevcut convert metodunu kullan
	    }
	    return dtoTransactions;
	}

	@Override
	public DtoTransaction getTransactionById(Long id) {
        Transaction dbTransaction = this.getTransactionEntityById(id);
		return convertEntityToDto(dbTransaction);
	}

	@Override
	@Transactional
	public DtoTransaction updateTransaction(Long id, DtoTransactionIU dtoTransactionIU) {
        Transaction mevcutTransaction = this.getTransactionEntityById(id);

       
        if (!mevcutTransaction.getYukSahibi().getId().equals(dtoTransactionIU.getYukSahibiId())) {
            User yeniYukSahibi = userService.getUserEntityById(dtoTransactionIU.getYukSahibiId());
            mevcutTransaction.setYukSahibi(yeniYukSahibi);
        }

        if (!mevcutTransaction.getTasiyici().getId().equals(dtoTransactionIU.getTasiyiciId())) {
            User yeniTasiyici = userService.getUserEntityById(dtoTransactionIU.getTasiyiciId());
            mevcutTransaction.setTasiyici(yeniTasiyici);
        }

        if (!mevcutTransaction.getTeklif().getId().equals(dtoTransactionIU.getTeklifId())) {
            Offer yeniTeklif = offerService.getOfferEntityById(dtoTransactionIU.getTeklifId());
            mevcutTransaction.setTeklif(yeniTeklif);
        }

     
        mevcutTransaction.setMiktar(dtoTransactionIU.getMiktar());
        mevcutTransaction.setDurum(TransactionStatus.valueOf(dtoTransactionIU.getDurum().toUpperCase()));
   
        double miktar = dtoTransactionIU.getMiktar();
        double komisyon = miktar * KOMISYON_ORANI;
        mevcutTransaction.setKomisyonTutari(komisyon);
        

		Transaction updatedTransaction = transactionRepository.save(mevcutTransaction);
        
		return convertEntityToDto(updatedTransaction);
	}

  
	@Override
	@Transactional
	public DtoTransaction deleteTransaction(Long id) {
        Transaction dbTransaction = this.getTransactionEntityById(id);
		
		transactionRepository.delete(dbTransaction);
		
 
		return convertEntityToDto(dbTransaction);
	}
	
	public Transaction getTransactionEntityById(Long id) {
		return transactionRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("ID'si " + id + " olan işlem bulunamadı."));
	}
}