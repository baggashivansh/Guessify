package com.guessify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuessifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(GuessifyApplication.class, args);
    }
}
