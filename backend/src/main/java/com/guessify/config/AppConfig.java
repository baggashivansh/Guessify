package com.guessify.config;

import com.guessify.GuessifyApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableConfigurationProperties(GuessifyProperties.class)
public class AppConfig {
}
