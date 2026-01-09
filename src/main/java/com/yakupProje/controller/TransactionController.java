package com.yakupProje.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.yakupProje.dto.DtoTransaction;
import com.yakupProje.dto.DtoTransactionIU;
import com.yakupProje.services.ITransactionService; 
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rest/v1/transactions")
public class TransactionController {

    private final ITransactionService transactionService;

    public TransactionController(ITransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping(path = "/save")
    public ResponseEntity<DtoTransaction> saveTransaction(@RequestBody DtoTransactionIU dtoTransactionIU) {
        try {
            DtoTransaction savedTransaction = transactionService.saveTransaction(dtoTransactionIU);
            return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED); 
        } catch (RuntimeException e) {
            // Örneğin: İlişkili yük/teklif/kullanıcı ID'si bulunamadı
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); 
        }
    }
    
    
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')") // Sadece admin erişebilir
    public ResponseEntity<List<DtoTransaction>> getAllTransactionsAdmin() {
        return ResponseEntity.ok(transactionService.getAllTransactionsAdmin());
    }
    

    @GetMapping(path = "/my-transactions") // Endpoint ismini özelleştirdik
    public ResponseEntity<List<DtoTransaction>> getMyTransactions() {
        List<DtoTransaction> transactions = transactionService.getMyTransactions();
        return ResponseEntity.ok(transactions);
    }
    @GetMapping("/{id}")
    public ResponseEntity<DtoTransaction> getTransactionById(@PathVariable Long id) {
        try {
            DtoTransaction transaction = transactionService.getTransactionById(id);
            return new ResponseEntity<>(transaction, HttpStatus.OK);
        } catch (RuntimeException e) {
            // İşlem bulunamadı hatası
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DtoTransaction> updateTransaction(@PathVariable Long id, @RequestBody DtoTransactionIU dtoTransactionIU) {
        try {
            DtoTransaction updatedTransaction = transactionService.updateTransaction(id, dtoTransactionIU);
            return new ResponseEntity<>(updatedTransaction, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Bulunamadı veya geçersiz veri hatası
            if (e.getMessage().contains("bulunamadı")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); 
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DtoTransaction> deleteTransaction(@PathVariable Long id) {
        try {
            DtoTransaction deletedTransaction = transactionService.deleteTransaction(id);
            return new ResponseEntity<>(deletedTransaction, HttpStatus.OK);
        } catch (RuntimeException e) {
            // İşlem bulunamadı hatası
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }
}