package com.yakupProje.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yakupProje.enums.UserType;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users", schema = "yuk_takip_sistemi")
@EqualsAndHashCode(exclude = {
	    "trucks", "createdLoads", "offers", "transactionsYapan", "transactionsAlan",
	    "ratingsPuanlayan", "ratingsPuanlanan", "messagesGonderen", "messagesAlici",
	    "yuklenenDokumentler"
})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ad;
    private String soyad;

    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private boolean aktif = false;



    @Column(name = "sifre_hash", nullable = false)
    private String sifreHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private UserType userType;

    private String sirketAdi;
    private String vergiNumarasi;
    private String telefon;
    @Column(name = "average_rating")
    private Double averageRating = 0.0;
    @Column(name = "balance")
    private Double balance = 0.0;

    @CreationTimestamp
    private LocalDateTime olusturulmaTarihi;

    @UpdateTimestamp
    private LocalDateTime guncellenmeTarihi;
    
    private static final long serialVersionUID = 1L;

    @OneToMany(mappedBy = "truckSahip") @JsonIgnore
    private Set<Truck> trucks;

    @OneToMany(mappedBy = "yukSahibi") @JsonIgnore
    private Set<Load> createdLoads;

    @OneToMany(mappedBy = "tasiyici") @JsonIgnore
    private Set<Offer> offers;

    @OneToMany(mappedBy = "yukSahibi") @JsonIgnore
    private Set<Transaction> transactionsYapan;

    @OneToMany(mappedBy = "tasiyici") @JsonIgnore
    private Set<Transaction> transactionsAlan;

    @OneToMany(mappedBy = "puanlayanKullanici") @JsonIgnore
    private Set<Rating> ratingsPuanlayan;

    @OneToMany(mappedBy = "puanlananKullanici") @JsonIgnore
    private Set<Rating> ratingsPuanlanan;

    @OneToMany(mappedBy = "gonderen") @JsonIgnore
    private Set<Message> messagesGonderen;

    @OneToMany(mappedBy = "alici") @JsonIgnore
    private Set<Message> messagesAlici;

    @OneToMany(mappedBy = "yukleyenKullanici") @JsonIgnore
    private Set<Document> yuklenenDokumentler;


    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (userType == null) return List.of();
        return List.of(new SimpleGrantedAuthority("ROLE_" + userType.name()));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return this.sifreHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() {
    	return true;// 🔥 KRİTİK
    }
}
