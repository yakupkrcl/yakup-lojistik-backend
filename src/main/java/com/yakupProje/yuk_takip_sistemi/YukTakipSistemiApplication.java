package com.yakupProje.yuk_takip_sistemi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication(scanBasePackages = {"com.yakupProje"})
@EntityScan(basePackages = {"com.yakupProje"})
@ComponentScan(basePackages = {"com.yakupProje"})
@EnableJpaRepositories(basePackages = {"com.yakupProje"})
public class YukTakipSistemiApplication {

	public static void main(String[] args) {
		SpringApplication.run(YukTakipSistemiApplication.class, args);
	}

}
