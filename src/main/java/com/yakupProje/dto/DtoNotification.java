package com.yakupProje.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DtoNotification {

    private Long id;
    private String message;
    private boolean okundu;
    private LocalDateTime createdAt;
    
    private String targetUrl; 
    
    private Long loadId;
}