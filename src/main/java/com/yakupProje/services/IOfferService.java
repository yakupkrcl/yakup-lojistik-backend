package com.yakupProje.services;

import java.util.List;

import com.yakupProje.dto.DtoOffer;
import com.yakupProje.dto.DtoOfferIU;
import com.yakupProje.dto.DtoOfferLite;
import com.yakupProje.enums.OfferStatus;

public interface IOfferService {

 
    DtoOffer saveOfferByDriver(DtoOfferIU dtoOfferIU, String driverEmail);
    List<DtoOffer> getOffersByDriver(String driverEmail);

  
    List<DtoOffer> getAllOffers();
    DtoOfferLite startJourney(Long offerId);
    DtoOffer getOfferById(Long id);
    DtoOffer deleteOffer(Long id);
    public List<DtoOffer> getOffersByLoadIdDto(Long loadId);

    public void completeOfferByDriver(Long offerId);
    public DtoOffer updateOfferStatusByShipper(Long offerId, String shipperEmail, OfferStatus newStatus, String odemeYontemi);
    
}
