package com.yakupProje.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yakupProje.dto.DtoMessage;
import com.yakupProje.dto.DtoMessageIU;
import com.yakupProje.services.MessageService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/rest/v1/messages")
public class MessageController {


	@Autowired
	private MessageService messageService;

   
	
	@PostMapping(path = "/save")
	public DtoMessage saveMessage(@RequestBody DtoMessageIU dtoMessageIU) {
		return messageService.saveMessage(dtoMessageIU);
	}
	
	@GetMapping(path = "/list")
	public List<DtoMessage> getAllMessage() {
		return messageService.getAllMessages();
	}
	
	@GetMapping(path = "/{id}")
	public ResponseEntity<DtoMessage> getMessageId(@PathVariable Long id) {
		Optional<DtoMessage> dbOptional=Optional.ofNullable(messageService.getMessageById(id));
		
		return dbOptional
				.map(ResponseEntity::ok)
				.orElseGet(()->ResponseEntity.notFound().build());
	}
	
	@PutMapping(path = "/{id}")
	public DtoMessage updateMessage(@PathVariable Long id,@RequestBody DtoMessageIU dtoMessageIU){
		
		return messageService.updateMessage(id, dtoMessageIU)
				;
	}
	
	@DeleteMapping(path = "/{id}")
	public DtoMessage deleteMessage(@PathVariable Long id){
		
		return messageService.deleteMessage(id)
			;
	}
	
}
