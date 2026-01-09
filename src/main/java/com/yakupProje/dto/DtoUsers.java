package com.yakupProje.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class DtoUsers {
	private Long id;
	private String ad; 
    private String soyad;
    private String email;
	private String userType;
	private String sirketAdi;
	private String vergiNumarasi;
	private String telefon;

	private Double ortalamaPuan;
	private Integer aracSayisi;
	private boolean aktif;
	private LocalDateTime olusturulmaTarihi;
	private LocalDateTime guncellenmeTarihi;

	 
    private Set<DtoTruckLite> trucks; 
    
	private List<Long> loadIds;
    private Double balance = 0.0;

    
    private Set<DtoOfferLite> offers; 
    
    private Set<DtoTransactionLite> transactionsYapan; 

    private Set<DtoTransactionLite> transactionsAlan; 

    private Set<DtoRatingLite> ratingsPuanlayan; 
    
    private Set<DtoRatingLite> ratingsPuanlanan; 

    private Set<DtoMessageLite> messagesGonderen; 
    
    private Set<DtoMessageLite> messagesAlici; 

    private Set<DtoDocumentLite> yuklenenDokumentler;
}
