package com.yakupProje.controller;

import com.yakupProje.dto.DtoUsers;
import com.yakupProje.dto.DtoUsersIU;
import com.yakupProje.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rest/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public List<DtoUsers> getDtoUserList() {
        return userService.getDtoUserList();
    }

    @GetMapping("/profile")
    public ResponseEntity<DtoUsers> getMyProfile() {
        // UserService içinde bu metodu birazdan tanımlayacağız
        return ResponseEntity.ok(userService.getMyProfile());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DtoUsers> updateUsers(
            @PathVariable Long id,
            @RequestBody DtoUsersIU dtoUsersIU) {

        return userService.updateOptional(id, dtoUsersIU)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DtoUsers> deleteUsers(@PathVariable Long id) {
        return userService.deleUsers(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public DtoUsers findById(@PathVariable Long id) {
        return userService.findById(id);
    }
}
