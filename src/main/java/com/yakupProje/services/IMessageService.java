package com.yakupProje.services;

import com.yakupProje.dto.DtoMessage;
import com.yakupProje.dto.DtoMessageIU;
import com.yakupProje.entity.Message;

import java.util.List;

public interface IMessageService {
      DtoMessage saveMessage(DtoMessageIU dtoMessageIU);
      List<DtoMessage> getAllMessages();
      DtoMessage getMessageById(Long id);
      DtoMessage updateMessage(Long id, DtoMessageIU dtoMessageIU);
      DtoMessage deleteMessage(Long id);
      public Message getMessageEntityById(Long id);
}
