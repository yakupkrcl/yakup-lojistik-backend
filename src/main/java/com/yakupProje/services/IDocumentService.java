package com.yakupProje.services;

import com.yakupProje.dto.DtoDocument;
import com.yakupProje.dto.DtoDocumentIU;
import com.yakupProje.entity.Document;
import com.yakupProje.enums.DocumentStatus;

import java.util.List;
import java.util.Optional;


public interface IDocumentService {
    DtoDocument saveDocument(DtoDocumentIU dtoDocumentIU);
    List<DtoDocument> getAllDocuments();
    
    
	public void adminUpdateDocumentStatus(Long documentId, DocumentStatus newStatus);
    Optional<DtoDocument> getDocumentById(Long id);
    Optional<DtoDocument> updateDocument(Long id, DtoDocumentIU dtoDocumentIU);
    Optional<DtoDocument> deleteDocument(Long id);
    public Document getDocumentEntityById(Long id);
}
