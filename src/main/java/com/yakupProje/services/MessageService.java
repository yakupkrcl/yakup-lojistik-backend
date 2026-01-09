package com.yakupProje.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.yakupProje.dto.DtoLoadLite;
import com.yakupProje.dto.DtoMessage;
import com.yakupProje.dto.DtoMessageIU;
import com.yakupProje.dto.DtoUserLite; 
import com.yakupProje.entity.Load;
import com.yakupProje.entity.Message;
import com.yakupProje.entity.User;
import com.yakupProje.repository.MessageRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional 
public class MessageService implements IMessageService{
	
	private final LoadService loadService;
	private final UserService userService;
	private final MessageRepository messageRepository;

    public MessageService(LoadService loadService, UserService userService, MessageRepository messageRepository) {
        this.loadService = loadService;
        this.userService = userService;
        this.messageRepository = messageRepository;
    }

	@Override
	public DtoMessage saveMessage(DtoMessageIU dtoMessageIU) {
	
		
		User gonderen=userService.getUserEntityById(dtoMessageIU.getGonderenId());
		User alıcı=userService.getUserEntityById(dtoMessageIU.getAliciId());
		Load yuk=loadService.getLoadEntityById(dtoMessageIU.getYukId());
		
		
		Message message=new Message();
		BeanUtils.copyProperties(dtoMessageIU, message);
   
		message.setGonderen(gonderen);
		message.setAlici(alıcı);
		message.setYuk(yuk);
		
		
		Message dbMessage=messageRepository.save(message);
		

		DtoMessage dto =new DtoMessage();
		BeanUtils.copyProperties(dbMessage, dto);
      
        dto.setGonderenId(dbMessage.getGonderen().getId());
        DtoUserLite gonderenLite = new DtoUserLite();
        BeanUtils.copyProperties(dbMessage.getGonderen(), gonderenLite);
        dto.setGonderen(gonderenLite);

        dto.setAliciId(dbMessage.getAlici().getId());
        DtoUserLite aliciLite = new DtoUserLite();
        BeanUtils.copyProperties(dbMessage.getAlici(), aliciLite);
        dto.setAlici(aliciLite);

        dto.setYukId(dbMessage.getYuk().getId());
        DtoLoadLite yukLite = new DtoLoadLite();
        BeanUtils.copyProperties(dbMessage.getYuk(), yukLite);
        yukLite.setKalkisAdresiId(dbMessage.getYuk().getKalkisAdresi().getId());
        yukLite.setVarisAdresiId(dbMessage.getYuk().getVarisAdresi().getId());
        dto.setYuk(yukLite);
		
		return dto;
	}

	@Override
	public List<DtoMessage> getAllMessages() {
		List<Message> messages=messageRepository.findAll();
    	List<DtoMessage> dtoMessages=new ArrayList<>();
		
		for (Message message : messages) {
			DtoMessage dto =new DtoMessage();
			BeanUtils.copyProperties(message, dto);

            dto.setGonderenId(message.getGonderen().getId());
            DtoUserLite gonderenLite = new DtoUserLite();
            BeanUtils.copyProperties(message.getGonderen(), gonderenLite);
            dto.setGonderen(gonderenLite);

            dto.setAliciId(message.getAlici().getId());
            DtoUserLite aliciLite = new DtoUserLite();
            BeanUtils.copyProperties(message.getAlici(), aliciLite);
            dto.setAlici(aliciLite);

            dto.setYukId(message.getYuk().getId());
            DtoLoadLite yukLite = new DtoLoadLite();
            BeanUtils.copyProperties(message.getYuk(), yukLite);
            yukLite.setKalkisAdresiId(message.getYuk().getKalkisAdresi().getId());
            yukLite.setVarisAdresiId(message.getYuk().getVarisAdresi().getId());
            dto.setYuk(yukLite);
	        
			dtoMessages.add(dto);
			
		}
		return dtoMessages;
	}

	@Override
	public DtoMessage getMessageById(Long id) {
		Message dbMessage=this.getMessageEntityById(id);
		
		DtoMessage dto =new DtoMessage();
		BeanUtils.copyProperties(dbMessage, dto);
        
        dto.setGonderenId(dbMessage.getGonderen().getId());
        DtoUserLite gonderenLite = new DtoUserLite();
        BeanUtils.copyProperties(dbMessage.getGonderen(), gonderenLite);
        dto.setGonderen(gonderenLite);

        dto.setAliciId(dbMessage.getAlici().getId());
        DtoUserLite aliciLite = new DtoUserLite();
        BeanUtils.copyProperties(dbMessage.getAlici(), aliciLite);
        dto.setAlici(aliciLite);

        dto.setYukId(dbMessage.getYuk().getId());
        DtoLoadLite yukLite = new DtoLoadLite();
        BeanUtils.copyProperties(dbMessage.getYuk(), yukLite);
        yukLite.setKalkisAdresiId(dbMessage.getYuk().getKalkisAdresi().getId());
        yukLite.setVarisAdresiId(dbMessage.getYuk().getVarisAdresi().getId());
        dto.setYuk(yukLite);
			
		return dto;
	}

	@Override
	public DtoMessage updateMessage(Long id, DtoMessageIU dtoMessageIU) {
		Message dbMessage=this.getMessageEntityById(id);
		
		dbMessage.setMesajMetni(dtoMessageIU.getMesajMetni());
		
        if (!dbMessage.getGonderen().getId().equals(dtoMessageIU.getGonderenId())) {
            User yeniGonderen = userService.getUserEntityById(dtoMessageIU.getGonderenId());
            dbMessage.setGonderen(yeniGonderen);
        }
        if (!dbMessage.getAlici().getId().equals(dtoMessageIU.getAliciId())) {
            User yeniAlici = userService.getUserEntityById(dtoMessageIU.getAliciId());
            dbMessage.setAlici(yeniAlici);
        }
        if (!dbMessage.getYuk().getId().equals(dtoMessageIU.getYukId())) {
            Load yeniYuk = loadService.getLoadEntityById(dtoMessageIU.getYukId());
            dbMessage.setYuk(yeniYuk);
        }

		Message updatedMessage = messageRepository.save(dbMessage);

		DtoMessage dto =new DtoMessage();
		BeanUtils.copyProperties(updatedMessage, dto);
        
        dto.setGonderenId(updatedMessage.getGonderen().getId());
        DtoUserLite gonderenLite = new DtoUserLite();
        BeanUtils.copyProperties(updatedMessage.getGonderen(), gonderenLite);
        dto.setGonderen(gonderenLite);

        dto.setAliciId(updatedMessage.getAlici().getId());
        DtoUserLite aliciLite = new DtoUserLite();
        BeanUtils.copyProperties(updatedMessage.getAlici(), aliciLite);
        dto.setAlici(aliciLite);

        dto.setYukId(updatedMessage.getYuk().getId());
        DtoLoadLite yukLite = new DtoLoadLite();
        BeanUtils.copyProperties(updatedMessage.getYuk(), yukLite);
        yukLite.setKalkisAdresiId(updatedMessage.getYuk().getKalkisAdresi().getId());
        yukLite.setVarisAdresiId(updatedMessage.getYuk().getVarisAdresi().getId());
        dto.setYuk(yukLite);
		
		return dto;
	}

	@Override
	public DtoMessage deleteMessage(Long id) {
		Message dbMessage=this.getMessageEntityById(id);

			messageRepository.delete(dbMessage);
            
			DtoMessage dtoMessage=new DtoMessage();
			BeanUtils.copyProperties(dbMessage, dtoMessage);
       
            dtoMessage.setGonderenId(dbMessage.getGonderen().getId());
            DtoUserLite gonderenLite = new DtoUserLite();
            BeanUtils.copyProperties(dbMessage.getGonderen(), gonderenLite);
            dtoMessage.setGonderen(gonderenLite);

            dtoMessage.setAliciId(dbMessage.getAlici().getId());
            DtoUserLite aliciLite = new DtoUserLite();
            BeanUtils.copyProperties(dbMessage.getAlici(), aliciLite);
            dtoMessage.setAlici(aliciLite);

            dtoMessage.setYukId(dbMessage.getYuk().getId());
            DtoLoadLite yukLite = new DtoLoadLite();
            BeanUtils.copyProperties(dbMessage.getYuk(), yukLite);
            yukLite.setKalkisAdresiId(dbMessage.getYuk().getKalkisAdresi().getId());
            yukLite.setVarisAdresiId(dbMessage.getYuk().getVarisAdresi().getId());
            dtoMessage.setYuk(yukLite);
	
		return dtoMessage;
	}
	
	public Message getMessageEntityById(Long id) {
		return messageRepository.findById(id)
		        .orElseThrow(() -> new RuntimeException("ID'si " + id + " olan mesaj bulunamadı."));
	}

}