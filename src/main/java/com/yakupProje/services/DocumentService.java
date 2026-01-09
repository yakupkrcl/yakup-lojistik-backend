package com.yakupProje.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.yakupProje.dto.DtoDocument;
import com.yakupProje.dto.DtoDocumentIU;
import com.yakupProje.dto.DtoLoadLite;
import com.yakupProje.dto.DtoUserLite;
import com.yakupProje.entity.Document;
import com.yakupProje.entity.Load;
import com.yakupProje.entity.User;
import com.yakupProje.enums.DocumentStatus;
import com.yakupProje.enums.DocumentType;
import com.yakupProje.repository.DocumentRepository;
import com.yakupProje.repository.UserRepository;
import jakarta.transaction.Transactional;

import java.io.IOException;

@Service
public class DocumentService implements IDocumentService {

	private final UserRepository userRepository;

	private final UserService userService;
	private final NotificationService notificationService;
	private final LoadService loadService;
	private final DocumentRepository documentRepository;
	private Long driverId;

	public DocumentService(DocumentRepository documentRepository, LoadService loadService,
			NotificationService notificationService, UserService userService, UserRepository userRepository) {
		this.documentRepository = documentRepository;
		this.loadService = loadService;
		this.userService = userService;
		this.userRepository = userRepository;
		this.notificationService = notificationService;
	}

	@Transactional
	public DtoDocument updateDocumentStatus(Long id, String status) {
	    // 1. Belgeyi bul
	    Document doc = documentRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Belge bulunamadı"));

	    // 2. Enum'a çevir
	    DocumentStatus newStatus = DocumentStatus.valueOf(status.toUpperCase());
	    
	    // 3. ASIL MANTIĞI ÇALIŞTIR (Diğer metodunu burada çağırıyoruz)
	    adminUpdateDocumentStatus(id, newStatus);

	    // 4. Güncel halini geri dön
	    Document saved = documentRepository.findById(id).get();
	    DtoDocument dto = new DtoDocument();
	    BeanUtils.copyProperties(saved, dto);
	    return dto;
	}

	@Override
	public DtoDocument saveDocument(DtoDocumentIU dtoDocumentIU) {

		User yukleyenuser = userService.getUserEntityById(dtoDocumentIU.getYukleyenKullaniciId());
		Load load = null;
		if (dtoDocumentIU.getYukId() != null) {
			load = loadService.getLoadEntityById(dtoDocumentIU.getYukId());
		}

		Document document = new Document();
		BeanUtils.copyProperties(dtoDocumentIU, document);

		document.setYuk(load);
		document.setYukleyenKullanici(yukleyenuser);
		document.setYuklenmeTarihi(LocalDateTime.now());

		if (dtoDocumentIU.getBelgeTipi() != null && !dtoDocumentIU.getBelgeTipi().isEmpty()) {
			try {
				DocumentType type = DocumentType.valueOf(dtoDocumentIU.getBelgeTipi().toUpperCase());
				document.setBelgeTipi(type);
			} catch (IllegalArgumentException e) {
				throw new RuntimeException("Geçersiz Belge Tipi: " + dtoDocumentIU.getBelgeTipi());
			}
		} else {
		}

		Document dbDocument = documentRepository.save(document);

		DtoDocument dtoDocument = new DtoDocument();
		BeanUtils.copyProperties(dbDocument, dtoDocument);

		dtoDocument.setYukleyenKullaniciId(dbDocument.getYukleyenKullanici().getId());
		DtoUserLite userLite = new DtoUserLite();
		BeanUtils.copyProperties(dbDocument.getYukleyenKullanici(), userLite);
		if (dbDocument.getYukleyenKullanici().getUserType() != null) {
			userLite.setUserType(dbDocument.getYukleyenKullanici().getUserType());
		}

		dtoDocument.setYukleyenKullanici(userLite);

		if (dbDocument.getYuk() != null) {
			dtoDocument.setYukId(dbDocument.getYuk().getId());
			DtoLoadLite loadLite = new DtoLoadLite();
			BeanUtils.copyProperties(dbDocument.getYuk(), loadLite);
			loadLite.setKalkisAdresiId(dbDocument.getYuk().getKalkisAdresi().getId());
			loadLite.setVarisAdresiId(dbDocument.getYuk().getVarisAdresi().getId());
			dtoDocument.setYuk(loadLite);
		}

		return dtoDocument;
	}

	@Transactional
	public void adminUpdateDocumentStatus(Long documentId, DocumentStatus newStatus) {

	    // 1️⃣ Belgeyi bul
	    Document doc = documentRepository.findById(documentId)
	            .orElseThrow(() -> new RuntimeException("Belge bulunamadı"));

	    // 2️⃣ Belge status güncelle ve kaydet
	    doc.setStatus(newStatus);
	    documentRepository.saveAndFlush(doc); // Hemen DB'ye yaz ki sayarken güncel hali görsün

	    User user = doc.getYukleyenKullanici();
	    
	    // 3️⃣ ZORUNLU BELGE TİPLERİ
	    List<DocumentType> zorunluBelgeler = List.of(
	            DocumentType.EHLIYET_ON,
	            DocumentType.EHLIYET_ARKA,
	            DocumentType.SRC_BELGESI,
	            DocumentType.PSIKOTEKNIK_BELGESI,
	            DocumentType.ARAC_RUHSATI
	    );

	    // 4️⃣ ONAYLANMIŞ zorunlu belgeleri say
	    List<Document> onayliBelgeler =
	            documentRepository.findByYukleyenKullaniciIdAndBelgeTipiInAndStatus(
	                    user.getId(),
	                    zorunluBelgeler,
	                    DocumentStatus.ONAYLANDI
	            );

	    // 5️⃣ REDDEDİLMİŞ belge var mı kontrol et
	    boolean redVarMi =
	            documentRepository.existsByYukleyenKullaniciIdAndStatus(
	                    user.getId(),
	                    DocumentStatus.REDDEDILDI
	            );

	    // 6️⃣ AKTİFLİK KARARI (Tüm zorunlu belgeler onaylı ve hiç red yoksa)
	    boolean aktifMi = !redVarMi && onayliBelgeler.size() >= zorunluBelgeler.size();

	    // 7️⃣ KULLANICIYI GÜNCELLE
	    if (aktifMi) {
	        user.setAktif(true);
	    } else {
	        user.setAktif(false); // Eğer bir belge reddedildiyse veya eksikse pasife çek
	    }

	    // 8️⃣ BİLDİRİMLER
	    if (newStatus == DocumentStatus.REDDEDILDI) {
	        notificationService.createNotification(
	                user.getId(),
	                "Belgeniz reddedildi. Lütfen bilgileri kontrol edip yeniden yükleyin.",
	                null,
	                "/driver/documents"
	        );
	    } else if (aktifMi) {
	        notificationService.createNotification(
	                user.getId(),
	                "Tebrikler! Tüm belgeleriniz onaylandı, artık teklif verebilirsiniz.",
	                null,
	                "/driver/available-loads"
	        );
	    }

	    // 9️⃣ KULLANICIYI DB'YE BAS
	    userRepository.saveAndFlush(user);
	    
	    // Konsoldan takip etmek için (Opsiyonel)
	    System.out.println("LOG: Sürücü " + user.getAd() + " Aktiflik Durumu: " + user.isAktif());
	}

	
	
	@Transactional
	public void approveDocument(Long documentId) {

	    Document document = documentRepository.findById(documentId)
	            .orElseThrow(() -> new RuntimeException("Belge bulunamadı"));

	    // 1️⃣ Belgeyi onayla
	    document.setStatus(DocumentStatus.ONAYLANDI);
	    documentRepository.save(document);

	    User driver = document.getYukleyenKullanici();

	    // 2️⃣ Driver’ın zorunlu belgeleri var mı kontrol et
	    List<DocumentType> zorunluBelgeler = List.of(
	            DocumentType.EHLIYET_ON,
	            DocumentType.EHLIYET_ARKA,
	            DocumentType.SRC_BELGESI,
	            DocumentType.PSIKOTEKNIK_BELGESI,
	            DocumentType.ARAC_RUHSATI
	    );

	    boolean eksikVeyaOnaysizVar =
	            documentRepository.existsByYukleyenKullaniciAndBelgeTipiInAndStatusNot(
	                    driver,
	                    zorunluBelgeler,
	                    DocumentStatus.ONAYLANDI
	            );

	    // 3️⃣ Hepsi onaylıysa driver aktif olur
	    if (!eksikVeyaOnaysizVar) {
	        driver.setAktif(true);
	        userRepository.save(driver);
	    }
	}


	@Transactional
	public DtoDocument uploadDriverDocument(MultipartFile file, DocumentType belgeTipi, User currentUser) {
		return uploadInternal(file, belgeTipi, null, currentUser);
	}

	@Transactional
	public DtoDocument uploadLoadDocument(Long loadId, MultipartFile file, DocumentType belgeTipi, User currentUser) {
		Load load = loadService.getLoadEntityById(loadId);
		return uploadInternal(file, belgeTipi, load, currentUser);
	}

	@Transactional
	private DtoDocument uploadInternal(
	        MultipartFile file,
	        DocumentType belgeTipi,
	        Load load,
	        User currentUser
	) {
	    String originalName = file.getOriginalFilename() != null
	            ? file.getOriginalFilename().replace(" ", "_")
	            : "dosya";

	    String fileName = System.currentTimeMillis() + "_" + originalName;
	    String uploadDir = "uploads/documents/";

	    try {
	        var path = java.nio.file.Paths.get(uploadDir);
	        if (!java.nio.file.Files.exists(path)) {
	            java.nio.file.Files.createDirectories(path);
	        }
	        java.nio.file.Files.copy(
	                file.getInputStream(),
	                path.resolve(fileName),
	                java.nio.file.StandardCopyOption.REPLACE_EXISTING
	        );
	    } catch (IOException e) {
	        throw new RuntimeException("Dosya kaydedilemedi");
	    }

	    Document document = new Document();
	    document.setDosyaAdi(fileName);
	    document.setDepolamaYolu(uploadDir + fileName);
	    document.setMimeTipi(file.getContentType());
	    document.setBelgeTipi(belgeTipi);
	    document.setYuk(load);
	    document.setYukleyenKullanici(currentUser);

	    // 🔴 HER ZAMAN ADMIN ONAYI BEKLER
	    document.setStatus(DocumentStatus.BEKLEMEDE);

	    Document saved = documentRepository.save(document);

	    DtoDocument dto = new DtoDocument();
	    BeanUtils.copyProperties(saved, dto);
	    dto.setYukleyenKullaniciId(currentUser.getId());
	    if (load != null) {
	        dto.setYukId(load.getId());
	    }

	    return dto;
	}


	@Override
	public List<DtoDocument> getAllDocuments() {
		documentRepository.flush();
		List<Document> documents = documentRepository.findAll();
		List<DtoDocument> dtoDocuments = new ArrayList<>();

		for (Document document : documents) {
			DtoDocument dtoDocument = new DtoDocument();
			BeanUtils.copyProperties(document, dtoDocument);
			if (document.getStatus() != null) {
	            dtoDocument.setStatus(document.getStatus().name()); 
	        }

			if (document.getYukleyenKullanici() != null) {
				dtoDocument.setYukleyenKullaniciId(document.getYukleyenKullanici().getId());
				DtoUserLite userLite = new DtoUserLite();
				BeanUtils.copyProperties(document.getYukleyenKullanici(), userLite);
				if (document.getYukleyenKullanici().getUserType() != null) {
					userLite.setUserType(document.getYukleyenKullanici().getUserType());
				}

				dtoDocument.setYukleyenKullanici(userLite);
			}

			if (document.getYuk() != null) {
				dtoDocument.setYukId(document.getYuk().getId());
				DtoLoadLite loadLite = new DtoLoadLite();
				BeanUtils.copyProperties(document.getYuk(), loadLite);

				loadLite.setKalkisAdresiId(document.getYuk().getKalkisAdresi().getId());
				loadLite.setVarisAdresiId(document.getYuk().getVarisAdresi().getId());
				dtoDocument.setYuk(loadLite);
			}

			dtoDocuments.add(dtoDocument);
		}
		return dtoDocuments;
	}

	@Override
	public Optional<DtoDocument> getDocumentById(Long id) {
		Optional<Document> documentOptional = documentRepository.findById(id);

		if (documentOptional.isPresent()) {
			Document dbDocument = documentOptional.get();

			DtoDocument dtoDocument = new DtoDocument();
			BeanUtils.copyProperties(dbDocument, dtoDocument);

			dtoDocument.setYukleyenKullaniciId(dbDocument.getYukleyenKullanici().getId());
			DtoUserLite userLite = new DtoUserLite();
			BeanUtils.copyProperties(dbDocument.getYukleyenKullanici(), userLite);
			dtoDocument.setYukleyenKullanici(userLite);

			if (dbDocument.getYuk() != null) {
				dtoDocument.setYukId(dbDocument.getYuk().getId());
				DtoLoadLite loadLite = new DtoLoadLite();
				BeanUtils.copyProperties(dbDocument.getYuk(), loadLite);
				if (dbDocument.getYukleyenKullanici().getUserType() != null) {
					userLite.setUserType(dbDocument.getYukleyenKullanici().getUserType());
				}

				loadLite.setKalkisAdresiId(dbDocument.getYuk().getKalkisAdresi().getId());
				loadLite.setVarisAdresiId(dbDocument.getYuk().getVarisAdresi().getId());
				dtoDocument.setYuk(loadLite);
			}

			return Optional.of(dtoDocument);
		}
		return Optional.empty();
	}

	@Override
	public Optional<DtoDocument> updateDocument(Long id, DtoDocumentIU dtoDocumentIU) {
		Document dbDocument = this.getDocumentEntityById(id);

		dbDocument.setDosyaAdi(dtoDocumentIU.getDosyaAdi());
		dbDocument.setDepolamaYolu(dtoDocumentIU.getDepolamaYolu());
		dbDocument.setMimeTipi(dtoDocumentIU.getMimeTipi());
		dbDocument.setYuklenmeTarihi(LocalDateTime.now()); // PreUpdate ile de setleniyor olabilir

		if (!dbDocument.getYukleyenKullanici().getId().equals(dtoDocumentIU.getYukleyenKullaniciId())) {
			User yeniUser = userService.getUserEntityById(dtoDocumentIU.getYukleyenKullaniciId());
			dbDocument.setYukleyenKullanici(yeniUser);
		}

		if (dbDocument.getYuk() == null || !dbDocument.getYuk().getId().equals(dtoDocumentIU.getYukId())) {
			Load yeniLoad = (dtoDocumentIU.getYukId() != null) ? loadService.getLoadEntityById(dtoDocumentIU.getYukId())
					: null;
			dbDocument.setYuk(yeniLoad);
		}

		if (dtoDocumentIU.getBelgeTipi() != null && !dtoDocumentIU.getBelgeTipi().isEmpty()) {
			try {
				DocumentType type = DocumentType.valueOf(dtoDocumentIU.getBelgeTipi().toUpperCase());
				dbDocument.setBelgeTipi(type);
			} catch (IllegalArgumentException e) {
				throw new RuntimeException("Geçersiz Belge Tipi: " + dtoDocumentIU.getBelgeTipi());
			}
		}

		Document updateDocument = documentRepository.save(dbDocument);

		DtoDocument dto = new DtoDocument();
		BeanUtils.copyProperties(updateDocument, dto);

		dto.setYukleyenKullaniciId(updateDocument.getYukleyenKullanici().getId());
		DtoUserLite userLite = new DtoUserLite();
		BeanUtils.copyProperties(updateDocument.getYukleyenKullanici(), userLite);
		if (dbDocument.getYukleyenKullanici().getUserType() != null) {
			userLite.setUserType(dbDocument.getYukleyenKullanici().getUserType());
		}

		dto.setYukleyenKullanici(userLite);

		if (updateDocument.getYuk() != null) {
			dto.setYukId(updateDocument.getYuk().getId());
			DtoLoadLite loadLite = new DtoLoadLite();
			BeanUtils.copyProperties(updateDocument.getYuk(), loadLite);
			loadLite.setKalkisAdresiId(updateDocument.getYuk().getKalkisAdresi().getId());
			loadLite.setVarisAdresiId(updateDocument.getYuk().getVarisAdresi().getId());
			dto.setYuk(loadLite);
		}

		return Optional.of(dto);
	}

	@Override
	public Optional<DtoDocument> deleteDocument(Long id) {
		Document dbDocument = this.getDocumentEntityById(id);

		DtoDocument dtoDocument = new DtoDocument();
		BeanUtils.copyProperties(dbDocument, dtoDocument);

		dtoDocument.setYukleyenKullaniciId(dbDocument.getYukleyenKullanici().getId());
		DtoUserLite userLite = new DtoUserLite();
		BeanUtils.copyProperties(dbDocument.getYukleyenKullanici(), userLite);
		if (dbDocument.getYukleyenKullanici().getUserType() != null) {
			userLite.setUserType(dbDocument.getYukleyenKullanici().getUserType());
		}

		dtoDocument.setYukleyenKullanici(userLite);

		if (dbDocument.getYuk() != null) {
			dtoDocument.setYukId(dbDocument.getYuk().getId());
			DtoLoadLite loadLite = new DtoLoadLite();
			BeanUtils.copyProperties(dbDocument.getYuk(), loadLite);
			loadLite.setKalkisAdresiId(dbDocument.getYuk().getKalkisAdresi().getId());
			loadLite.setVarisAdresiId(dbDocument.getYuk().getVarisAdresi().getId());
			dtoDocument.setYuk(loadLite);
		}

		documentRepository.delete(dbDocument);

		return Optional.of(dtoDocument);
	}

	public Document getDocumentEntityById(Long id) {
		return documentRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("ID'si " + id + " olan belge bulunamadı."));
	}
}