package com.yakupProje.services;

import java.util.List;

import com.yakupProje.dto.DtoTransaction;
import com.yakupProje.dto.DtoTransactionIU;
import com.yakupProje.entity.Transaction;

public interface ITransactionService {
	
	public DtoTransaction saveTransaction(DtoTransactionIU dtoTransactionIU);
	public List<DtoTransaction> getMyTransactions();
	public DtoTransaction getTransactionById(Long id);
	public DtoTransaction updateTransaction(Long id, DtoTransactionIU dtoTransactionIU);
	public DtoTransaction deleteTransaction(Long id);
	public Transaction getTransactionEntityById(Long id);
	public List<DtoTransaction> getAllTransactionsAdmin();
}
