package com.yakupProje.controller;

import com.yakupProje.dto.DtoJwtResponse;
import com.yakupProje.dto.DtoLoginRequest;
import com.yakupProje.dto.DtoUserLite;
import com.yakupProje.dto.DtoUsers;
import com.yakupProje.dto.DtoUsersIU;
import com.yakupProje.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

  
 // AuthController.java içinde

    @GetMapping("/me") // Bu satır sayesinde /rest/v1/auth/me adresi oluşur
    public ResponseEntity<DtoUserLite> getMyProfile() {
        // UserService içindeki o yeni yazdığımız metodu çağırıyoruz
        return ResponseEntity.ok(userService.getLoggedInUserDto());
    }
    @PostMapping("/register")
    public ResponseEntity<DtoUsers> register(@RequestBody DtoUsersIU dtoUsersIU) {
        return ResponseEntity.ok(userService.saveDtoUsers(dtoUsersIU));
    }

   
    @PostMapping("/login")
    public ResponseEntity<DtoJwtResponse> login(@RequestBody DtoLoginRequest dto) {
        return ResponseEntity.ok(userService.login(dto));
    }
}
