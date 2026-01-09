package com.yakupProje.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails; 
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.yakupProje.dto.DtoUsers;
import com.yakupProje.dto.DtoUsersIU;
import com.yakupProje.dto.DtoJwtResponse;
import com.yakupProje.dto.DtoLoginRequest;
import com.yakupProje.dto.DtoUserLite;
import com.yakupProje.entity.Load;
import com.yakupProje.entity.User;
import com.yakupProje.enums.UserType;
import com.yakupProje.repository.RatingRepository;
import com.yakupProje.repository.UserRepository;
import com.yakupProje.security.JwtUtils;

@Service
public class UserService implements IUserService { 
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RatingRepository ratingRepository;
    
     @Autowired
     private PasswordEncoder passwordEncoder;
     @Autowired
     private JwtUtils jwtUtils;
     @Autowired
     private AuthenticationManager authenticationManager;
   
     @Override
     public Double getAverageRating(Long userId) {
         Double average = ratingRepository.getAverageRatingByUserId(userId);
         
         if (average == null) {
             return 0.0;
         }
         
         return average;
     }
     
    public DtoUsers saveDtoUsers(DtoUsersIU dtoUsersIU) {

        if (userRepository.existsByEmail(dtoUsersIU.getEmail())) {
            throw new RuntimeException("Bu email zaten kayıtlı: " + dtoUsersIU.getEmail());
        }

        String userTypeStr = dtoUsersIU.getUserType();
        
        if (userTypeStr == null || userTypeStr.trim().isEmpty()) {
            throw new RuntimeException("Kullanıcı tipi boş bırakılamaz."); // Hata fırlatın
        }
        
        UserType userType;
        try {
            userType = UserType.valueOf(userTypeStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Geçersiz kullanıcı tipi: " + userTypeStr, e);
        }

        User user = new User();
        BeanUtils.copyProperties(dtoUsersIU, user);

        if (dtoUsersIU.getPassword() == null || dtoUsersIU.getPassword().isEmpty()) {
            throw new RuntimeException("Şifre boş olamaz.");
        }

        user.setSifreHash(passwordEncoder.encode(dtoUsersIU.getPassword()));
        user.setUserType(userType);
        
       
        User dbUser = userRepository.save(user);

        DtoUsers dto = new DtoUsers();
        BeanUtils.copyProperties(dbUser, dto);
        dto.setUserType(user.getUserType().name());

        return dto;
    }

 // UserService.java içinde

    public DtoUserLite getLoggedInUserDto() {
        // 1. Token'dan giriş yapanın email bilgisini çek
        String email = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName();
        
        // 2. Kullanıcıyı bul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        // 3. DTO'ya çevir
        DtoUserLite dto = new DtoUserLite();
        org.springframework.beans.BeanUtils.copyProperties(user, dto);
        
        // 4. AKTİFLİK DURUMUNU SETLE (En önemli kısım!)
        dto.setAktif(user.isAktif()); 
        
        return dto;
    }
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Kullanıcı authenticate değil");
        }

        Object principal = authentication.getPrincipal();

        String email;

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String) {
            email = principal.toString();
        } else {
            throw new RuntimeException("Principal tipi bilinmiyor");
        }

        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + email));
    }

    public DtoJwtResponse login(DtoLoginRequest dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtils.generateToken(userDetails);

            User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı veritabanında bulunamadı."));

            DtoJwtResponse response = new DtoJwtResponse();
            response.setToken(jwt);
            response.setId(user.getId());
            response.setAd(user.getAd());
            response.setSoyad(user.getSoyad());
            response.setEmail(user.getEmail());
            response.setUserType(user.getUserType() != null ? user.getUserType().name() : null);

            return response;

        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Login sırasında beklenmeyen hata: " + ex.getMessage(), ex);
        }
    }

 // UserService içindeki getMyProfile metodu
    public DtoUsers getMyProfile() {
        // SecurityContextHolder'dan o anki giriş yapmış kişinin email/username bilgisini alıyoruz
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();

        // Kullanıcıyı bulup DTO'ya çevirip dönüyoruz
        User user = userRepository.findByEmail(username) // veya sendeki bulma metodu hangisiyse
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        DtoUsers dto = new DtoUsers();
        org.springframework.beans.BeanUtils.copyProperties(user, dto);
        dto.setBalance(user.getBalance()); // 💰 Bakiyeyi DTO'ya setlemeyi unutma!
        return dto;
    }
    
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ID " + id + " olan kullanıcı bulunamadı."));
    }

    public Optional<User> findUserByUsername(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<DtoUsers> getDtoUserList() {
        List<User> userList = userRepository.findAll();
        List<DtoUsers> dtoUsersList = new ArrayList<>();

        for (User user : userList) {
            DtoUsers dto = new DtoUsers();
            BeanUtils.copyProperties(user, dto);
            
            if (user.getUserType() != null) {
                dto.setUserType(user.getUserType().name()); 
            }

            if (user.getCreatedLoads() != null) {
                List<Long> loadIds = user.getCreatedLoads()
                        .stream()
                        .map(Load::getId)
                        .toList();

                dto.setLoadIds(loadIds);
            }

            dtoUsersList.add(dto);
        }

        return dtoUsersList;
    }


	@Override
	public Optional<DtoUsers> updateOptional(Long id, DtoUsersIU dtoUsersIU) {
		
		User user=this.getUserEntityById(id);
		
		Optional<User> existingUser = userRepository.findByEmail(dtoUsersIU.getEmail());
		if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
	        throw new RuntimeException("Bu e-posta adresi zaten başka bir kullanıcı tarafından kullanılıyor.");
	    }
		
		user.setAd(dtoUsersIU.getAd());
		user.setSoyad(dtoUsersIU.getSoyad());
		user.setEmail(dtoUsersIU.getEmail());
		user.setSirketAdi(dtoUsersIU.getSirketAdi());
		user.setVergiNumarasi(dtoUsersIU.getVergiNumarasi());
		user.setTelefon(dtoUsersIU.getTelefon());
		
		if (dtoUsersIU.getPassword() != null && !dtoUsersIU.getPassword().isEmpty()) {
			user.setSifreHash(passwordEncoder.encode(dtoUsersIU.getPassword()));	    }

	    if (dtoUsersIU.getUserType() != null) {
	        try {
	            user.setUserType(UserType.valueOf(dtoUsersIU.getUserType().toUpperCase()));
	        } catch (IllegalArgumentException e) {
	            throw new RuntimeException("Geçersiz kullanıcı tipi: " + dtoUsersIU.getUserType());
	        }
	    }
		
		userRepository.save(user);
		
		DtoUsers dtoUsers=new DtoUsers();
		BeanUtils.copyProperties(user, dtoUsers);
		
		dtoUsers.setUserType(user.getUserType().name());
	
		return Optional.ofNullable(dtoUsers);
		
		
	}

	@Override
	public Optional<DtoUsers> deleUsers(Long id) {
		User user=this.getUserEntityById(id);
		
		userRepository.delete(user);
		
		DtoUsers dtoUsers=new DtoUsers();
		BeanUtils.copyProperties(user, dtoUsers);
		
		
		return Optional.ofNullable(dtoUsers);
	}
	
	@Override
    public User getUserEntityByEmail(String email) {        // Repository'den Optional<User> olarak çeker ve yoksa hata fırlatır
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("E-posta adresiyle eşleşen kullanıcı bulunamadı: " + email));
    }

	@Override
	public DtoUsers findById(Long id) {
		User user=this.getUserEntityById(id);
	
		DtoUsers dtoUsers=new DtoUsers();
		BeanUtils.copyProperties(user, dtoUsers);
		if (user.getUserType() != null) {
	        dtoUsers.setUserType(user.getUserType().name());
	    }
		return dtoUsers;
		
				
		
	}


	@Override
	public void saveUserEntity(User user) {
	    userRepository.save(user);
	}
}
