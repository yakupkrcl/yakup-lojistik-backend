package com.yakupProje.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.yakupProje.enums.TruckStatus;
import com.yakupProje.enums.TruckType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "truck")
@EqualsAndHashCode(exclude = {"truckSahip"})
public class Truck {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true, nullable = false)
	private String plakaNumarasi;
	private String markaModel;
	private Double maxAgirlik;
	private Double maxHacim;
	
	@Enumerated(EnumType.STRING)
    private TruckType truckType; 

    @Enumerated(EnumType.STRING)
	private TruckStatus durum;
	
    @CreationTimestamp
	private LocalDateTime olusturulmaTarihi;
    
    @CreationTimestamp
	private LocalDateTime guncellenmeTarihi;
	
    @ManyToOne 
    @JoinColumn(name = "owner_id", nullable = false)
    private User truckSahip;
}
