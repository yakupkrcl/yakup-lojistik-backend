package com.yakupProje.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yakupProje.entity.Load;
import com.yakupProje.entity.Offer;
import com.yakupProje.enums.OfferStatus;

public interface OfferRepository extends JpaRepository<Offer, Long>{

	boolean existsByYukIdAndTasiyiciId(Long id, Long id2);

	List<Offer> findByYukIdAndDurum(Long loadId, OfferStatus beklemede);
	List<Offer> findAllByOrderByIdDesc();
	 List<Offer> findByYuk_Id(Long loadId);
	 Offer findByYukAndDurum(Load yuk, OfferStatus durum);
	 List<Offer> findByTasiyici_Id(Long tasiyiciId);
}
