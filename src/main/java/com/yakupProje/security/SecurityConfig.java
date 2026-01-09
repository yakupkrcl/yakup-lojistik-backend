package com.yakupProje.security;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final AuthEntryPoint unauthorizedHandler;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(AuthEntryPoint unauthorizedHandler, JwtAuthFilter jwtAuthFilter) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    
    // 🛡️ BURASI KRİTİK: Security filtrelerini /uploads yolu için tamamen kapatır.
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers("/uploads/**", "/static/**", "/resources/**", "/favicon.ico");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // 🔓 PUBLIC
                .requestMatchers(
                    "/error",
                    "/rest/v1/auth/**",
                    "/auth/**",
                    "/rest/v1/loads/public"
                ).permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 🚚 DRIVER DOCUMENT UPLOAD (ÇOK ÖNEMLİ – ADMIN'DEN ÖNCE!)
             // SecurityConfig.java içinde
                .requestMatchers(HttpMethod.POST, "/rest/v1/documents/driver/documents").hasAnyAuthority("ROLE_TASIYICI", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/rest/v1/documents/my-documents").hasAnyAuthority("ROLE_TASIYICI", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/rest/v1/documents/loads/*/documents").hasAnyAuthority("ROLE_TASIYICI", "ROLE_ADMIN")
                .requestMatchers("/rest/v1/documents/**").hasAuthority("ROLE_ADMIN")
                // 🛡️ ADMIN DOCUMENT İŞLEMLERİ
                .requestMatchers(
                		
                    "/rest/v1/documents/list",
                    "/rest/v1/documents/**"
                ).hasAuthority("ROLE_ADMIN")

                // 🚚 DRIVER
                .requestMatchers("/rest/v1/loads/driver/**")
                    .hasAnyAuthority("ROLE_TASIYICI", "ROLE_ADMIN")

                .requestMatchers("/rest/v1/offers/driver/**")
                    .hasAnyAuthority("ROLE_TASIYICI", "ROLE_ADMIN")

                // 📦 SHIPPER
                .requestMatchers("/rest/v1/loads/shipper/**")
                    .hasAnyAuthority("ROLE_YUK_SAHIBI", "ROLE_ADMIN")

                .requestMatchers("/rest/v1/offers/shipper/**")
                    .hasAnyAuthority("ROLE_YUK_SAHIBI", "ROLE_ADMIN")

                // 🌍 ORTAK
                .requestMatchers(
                    "/rest/v1/loads/*/current-location",
                    "/rest/v1/loads/detail/**",
                    "/rest/v1/ratings/**",
                    "/rest/v1/transactions/**",
                    "/rest/v1/locations/**"
                ).authenticated()

                // 🔐 HER ŞEYİN SONU
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

}