package com.guessify.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SoloSession {
    private final String id;
    private final String sessionToken;
    private final String nickname;
    private final Difficulty difficulty;
    private final long secretNumber;
    private final long seed;
    private final List<Integer> guesses;
    private final Instant startedAt;
    private boolean finished;
    private Instant finishedAt;
    private long elapsedMs;

    public SoloSession(String id, String sessionToken, String nickname, Difficulty difficulty,
                       long secretNumber, long seed) {
        this.id = id;
        this.sessionToken = sessionToken;
        this.nickname = nickname;
        this.difficulty = difficulty;
        this.secretNumber = secretNumber;
        this.seed = seed;
        this.guesses = new ArrayList<>();
        this.startedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public String getNickname() {
        return nickname;
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

    public List<Integer> getGuesses() {
        return guesses;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }

    public long getElapsedMs() {
        return elapsedMs;
    }

    public void setElapsedMs(long elapsedMs) {
        this.elapsedMs = elapsedMs;
    }

    public int getGuessCount() {
        return guesses.size();
    }
}
