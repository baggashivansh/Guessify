package com.guessify.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "guessify")
public record GuessifyProperties(
        Cors cors,
        Room room,
        RateLimit rateLimit,
        Nickname nickname,
        Security security
) {
    public record Cors(String allowedOrigins) {}
    public record Room(int maxPlayers, int codeLength, int ttlHours) {}
    public record RateLimit(int guessesPerSecond, int requestsPerMinute) {}
    public record Nickname(int maxLength) {}
    public record Security(int sessionTtlHours, int maxGuessesPerGame, boolean requireOriginOnMutations, String dailySecret) {}
}
