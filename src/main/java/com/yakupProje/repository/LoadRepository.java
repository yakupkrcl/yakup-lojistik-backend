package com.yakupProje.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yakupProje.entity.Load;
import com.yakupProje.enums.LoadStatus;

@Repository
public interface LoadRepository extends JpaRepository<Load, Long>{

	List<Load> findByDurum(LoadStatus durum);
	List<Load> findByYukSahibi_Email(String email);
	List<Load> findByYukSahibi_EmailAndDurumIn(String email, List<LoadStatus> durum);
	List<Load> findAllByOrderByIdDesc();
	@Modifying
	@Query("""
	    update Load l 
	    set l.currentLat = :lat, l.currentLng = :lng 
	    where l.id = :id
	""")
	int updateCurrentLocation(
	    @Param("id") Long id,
	    @Param("lat") Double lat,
	    @Param("lng") Double lng
	);

	
	@EntityGraph(attributePaths = {"kalkisAdresi", "varisAdresi"})
	List<Load> findAll();
	List<Load> findByYukSahibi_EmailAndDurum(String ownerEmail, LoadStatus teslimEdildi);
	
}
