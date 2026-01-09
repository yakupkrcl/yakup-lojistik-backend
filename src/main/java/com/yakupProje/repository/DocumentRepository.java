package com.yakupProje.repository;

import com.yakupProje.dto.DtoDocument;
import com.yakupProje.entity.Document;
import com.yakupProje.entity.User;
import com.yakupProje.enums.DocumentStatus;
import com.yakupProje.enums.DocumentType;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByYukleyenKullaniciIdAndBelgeTipiInAndStatus(
            Long userId,
            List<DocumentType> belgeTipleri,
            DocumentStatus status
        );
    
    boolean existsByYukleyenKullaniciIdAndBelgeTipi(Long userId, DocumentType belgeTipi);


    List<Document> findByYukleyenKullaniciId(Long userId);

    List<Document> findByStatus(DocumentStatus status);
    boolean existsByYukleyenKullaniciAndBelgeTipiInAndStatusNot(
            User user,
            List<DocumentType> belgeTipleri,
            DocumentStatus status
    );
    boolean existsByYukleyenKullaniciIdAndStatus(
            Long userId,
            DocumentStatus status
    );
    long countByYukleyenKullaniciIdAndStatus(Long userId, DocumentStatus status);
}
