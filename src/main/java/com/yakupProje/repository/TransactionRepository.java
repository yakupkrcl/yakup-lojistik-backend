package com.yakupProje.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yakupProje.entity.Transaction;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>{

	List<Transaction> findByYukSahibi_Id(Long shipperId);
	Optional<Transaction> findByYuk(com.yakupProje.entity.Load load);
	Optional<Transaction> findByTeklif_Id(Long id);
	List<Transaction> findByYukSahibi_Email(String email);
}
