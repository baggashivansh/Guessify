package com.guessify.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Challenge {
    private final String code;
    private final Difficulty difficulty;
    private final long secretNumber;
    private final long seed;
    private final String creatorNickname;
    private final int creatorGuesses;
    private final long creatorTimeMs;
    private final Instant createdAt;
    private final Instant expiresAt;
    private final List<ChallengeAttempt> attempts;

    public Challenge(String code, Difficulty difficulty, long secretNumber, long seed,
                     String creatorNickname, int creatorGuesses, long creatorTimeMs, Instant expiresAt) {
        this.code = code;
        this.difficulty = difficulty;
        this.secretNumber = secretNumber;
        this.seed = seed;
        this.creatorNickname = creatorNickname;
        this.creatorGuesses = creatorGuesses;
        this.creatorTimeMs = creatorTimeMs;
        this.createdAt = Instant.now();
        this.expiresAt = expiresAt;
        this.attempts = new ArrayList<>();
    }

    public String getCode() {
        return code;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public long getSecretNumber() {
        return secretNumber;
    }

    public long getSeed() {
        return seed;
    }

    public String getCreatorNickname() {
        return creatorNickname;
    }

    public int getCreatorGuesses() {
        return creatorGuesses;
    }

    public long getCreatorTimeMs() {
        return creatorTimeMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public List<ChallengeAttempt> getAttempts() {
        return attempts;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
