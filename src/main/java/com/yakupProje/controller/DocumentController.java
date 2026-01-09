package com.yakupProje.controller;



import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.multipart.MultipartFile;

import com.yakupProje.dto.DtoDocument;
import com.yakupProje.dto.DtoDocumentIU;
import com.yakupProje.entity.User;
import com.yakupProje.enums.DocumentStatus;
import com.yakupProje.enums.DocumentType;
import com.yakupProje.services.DocumentService;
import com.yakupProje.services.UserService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/rest/v1/documents")
public class DocumentController {

	@Autowired
	private DocumentService documentService;
	
	@Autowired
	private UserService userService;


	@PostMapping(path = "/save")
	public DtoDocument saveDocument(@RequestBody DtoDocumentIU dtoDocumentIU) {
		return documentService.saveDocument(dtoDocumentIU);

	}

	@GetMapping(path = "/{id}")
	public ResponseEntity<DtoDocument> updateDocument(@PathVariable Long id){
		Optional<DtoDocument> optional=documentService.getDocumentById(id);
		return optional
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	}
	
	@PutMapping("/{id}/status")
	public ResponseEntity<DtoDocument> updateDocumentStatus(
	        @PathVariable Long id, 
	        @RequestParam String status) { // Dikkat: RequestParam olarak bekliyoruz
	    return ResponseEntity.ok(documentService.updateDocumentStatus(id, status));
	}
	
	@GetMapping
    public List<DtoDocument> getAllDocuments() {
        return documentService.getAllDocuments();
    }

	
	@PostMapping("/loads/{loadId}/documents")
	public ResponseEntity<?> uploadLoadDocument(
	    @PathVariable Long loadId,
	    @RequestParam MultipartFile file,
	    @RequestParam DocumentType belgeTipi
	) {
	    User currentUser = userService.getCurrentUserEntity();

	    documentService.uploadLoadDocument(
	        loadId,
	        file,
	        belgeTipi,
	        currentUser
	    );

	    return ResponseEntity.ok("Yük belgesi yüklendi");
	}

	
	@PostMapping("/driver/documents")
	public ResponseEntity<?> uploadDriverDocument(
	    @RequestParam MultipartFile file,
	    @RequestParam DocumentType belgeTipi
	) {
	    User currentUser = userService.getCurrentUserEntity();

	    documentService.uploadDriverDocument(
	        file,
	        belgeTipi,
	        currentUser
	    );

	    return ResponseEntity.ok("Sürücü belgesi yüklendi");
	}

	
	@PutMapping("/{id}/admin-status")
	public ResponseEntity<?> adminUpdateStatus(
	        @PathVariable Long id,
	        @RequestParam DocumentStatus status) {

	    documentService.adminUpdateDocumentStatus(id, status);
	    return ResponseEntity.ok("Belge durumu güncellendi");
	}

	
	@PutMapping(path = "/{id}")
	public ResponseEntity<DtoDocument> updateDocument(@PathVariable Long id,@RequestBody DtoDocumentIU dtoDocumentIU){
		Optional<DtoDocument> updated=documentService.updateDocument(id, dtoDocumentIU);
		
		return updated
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	}
	
	// DocumentController.java içine ekle
	@GetMapping("/my-documents")
	public ResponseEntity<List<DtoDocument>> getMyDocuments() {
	    User currentUser = userService.getCurrentUserEntity();
	    // getAllDocuments zaten tüm belgeleri çekiyor, biz sadece bu kullanıcıya ait olanları filtreleyelim
	    List<DtoDocument> allDocs = documentService.getAllDocuments();
	    List<DtoDocument> myDocs = allDocs.stream()
	        .filter(d -> d.getYukleyenKullaniciId().equals(currentUser.getId()))
	        .toList();
	    return ResponseEntity.ok(myDocs);
	}
	
	@DeleteMapping(path = "/{id}")
	public ResponseEntity<DtoDocument> deleteDocument(@PathVariable Long id){
		Optional<DtoDocument> optional=documentService.deleteDocument(id);
		return optional
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	
		
	}
	
	
	
}