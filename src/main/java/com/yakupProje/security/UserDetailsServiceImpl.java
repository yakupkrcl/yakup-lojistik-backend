package com.yakupProje.security;

import com.yakupProje.entity.User;
import com.yakupProje.repository.UserRepository;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepo;

    public UserDetailsServiceImpl(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        return userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Email bulunamadı: " + email)
                );
    }
}




