package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Set; 

@Entity
@Getter 
@Setter 
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "locations")
@EqualsAndHashCode(exclude = {"kalkisYükleri", "varisYükleri"}) // İlişki döngüsü engellendi
public class Location {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String sehir;
	private String ilce;
	private String tamAdres;
    
    private Double enlem; 
    private Double boylam; 
    
	@OneToMany(mappedBy = "kalkisAdresi")
	@JsonIgnore
    private Set<Load> kalkisYükleri;     
    @OneToMany(mappedBy = "varisAdresi")
    @JsonIgnore
    private Set<Load> varisYükleri; 
}
