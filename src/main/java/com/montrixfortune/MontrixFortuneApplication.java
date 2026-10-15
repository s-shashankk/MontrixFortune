package com.montrixfortune;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class MontrixFortuneApplication {

	public static void main(String[] args) {
		SpringApplication.run(MontrixFortuneApplication.class, args);
	}

}
