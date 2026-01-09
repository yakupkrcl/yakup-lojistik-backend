package com.yakupProje.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yakupProje.entity.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long>{

	@Query("SELECT AVG(r.puan) FROM Rating r WHERE r.puanlananKullanici.id = :userId")
	Double getAverageRatingByUserId(@Param("userId") Long userId);
	
	boolean existsByYukIdAndPuanlayanKullaniciId(Long yukId, Long puanlayanId);
	List<Rating> findByPuanlananKullaniciId(Long puanlananId);
}
