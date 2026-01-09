package com.yakupProje.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yakupProje.entity.Truck;

@Repository
public interface TruckRepository extends JpaRepository<Truck, Long>{

    boolean existsByPlakaNumarasi(String plakaNumarasi);

	
}
