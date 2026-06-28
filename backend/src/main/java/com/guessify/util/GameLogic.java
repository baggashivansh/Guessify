package com.guessify.util;

import com.guessify.config.GuessifyProperties;
import com.guessify.model.Difficulty;
import com.guessify.model.GuessResult;
import com.guessify.model.Warmth;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Component
public class GameLogic {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom secureRandom = new SecureRandom();
    private final GuessifyProperties properties;

    public GameLogic(GuessifyProperties properties) {
        this.properties = properties;
    }

    public String generateCode() {
        int length = properties.room().codeLength();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CODE_CHARS.charAt(secureRandom.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    public long generateSecretNumber(Difficulty difficulty, long seed) {
        Random rng = new Random(seed);
        int range = difficulty.getMax() - difficulty.getMin() + 1;
        return difficulty.getMin() + rng.nextInt(range);
    }

    public long dailySeed(Difficulty difficulty, LocalDate date) {
        String key = date.format(DateTimeFormatter.ISO_LOCAL_DATE) + ":" + difficulty.name();
        String secret = properties.security().dailySecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("guessify.security.daily-secret must be configured");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(key.getBytes(StandardCharsets.UTF_8));
            long seed = 0;
            for (int i = 0; i < 8; i++) {
                seed = (seed << 8) | (hash[i] & 0xffL);
            }
            return seed;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to derive daily seed", e);
        }
    }

    public GuessOutcome evaluateGuess(int guess, long secret, Difficulty difficulty) {
        GuessResult result;
        if (guess == secret) {
            result = GuessResult.CORRECT;
        } else if (guess < secret) {
            result = GuessResult.HIGHER;
        } else {
            result = GuessResult.LOWER;
        }
        Warmth warmth = computeWarmth(guess, secret, difficulty);
        return new GuessOutcome(result, warmth);
    }

    private Warmth computeWarmth(int guess, long secret, Difficulty difficulty) {
        if (guess == secret) {
            return Warmth.CORRECT;
        }
        long diff = Math.abs((long) guess - secret);
        long range = difficulty.getMax() - difficulty.getMin();
        double ratio = (double) diff / range;
        if (ratio <= 0.05) {
            return Warmth.HOT;
        }
        if (ratio <= 0.15) {
            return Warmth.WARM;
        }
        return Warmth.COLD;
    }

    public record GuessOutcome(GuessResult result, Warmth warmth) {}
}
