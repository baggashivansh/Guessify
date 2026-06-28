package com.guessify.util;

import com.guessify.config.GuessifyProperties;
import com.guessify.exception.GuessifyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitService {

    private final GuessifyProperties properties;
    private final Map<String, AtomicInteger> minuteCounters = new ConcurrentHashMap<>();
    private final Map<String, Long> lastGuessTime = new ConcurrentHashMap<>();

    public RateLimitService(GuessifyProperties properties) {
        this.properties = properties;
    }

    public void checkRequest(String clientKey) {
        String key = "req:" + clientKey;
        int count = minuteCounters.computeIfAbsent(key, k -> new AtomicInteger(0)).incrementAndGet();
        if (count > properties.rateLimit().requestsPerMinute()) {
            throw new GuessifyException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT",
                    "Too many requests. Please slow down.");
        }
    }

    public void checkGuess(String playerKey) {
        long now = System.currentTimeMillis();
        Long last = lastGuessTime.get(playerKey);
        long minInterval = 1000L / properties.rateLimit().guessesPerSecond();
        if (last != null && now - last < minInterval) {
            throw new GuessifyException(HttpStatus.TOO_MANY_REQUESTS, "GUESS_RATE_LIMIT",
                    "Please wait before guessing again.");
        }
        lastGuessTime.put(playerKey, now);
    }

    public void resetMinuteCounters() {
        minuteCounters.clear();
    }
}
