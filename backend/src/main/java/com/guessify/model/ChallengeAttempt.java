package com.guessify.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ChallengeAttempt {
    private final String id;
    private final String nickname;
    private final String sessionToken;
    private final List<Integer> guesses;
    private boolean finished;
    private Instant finishedAt;
    private long elapsedMs;
    private final Instant startedAt;

    public ChallengeAttempt(String id, String nickname, String sessionToken) {
        this.id = id;
        this.nickname = nickname;
        this.sessionToken = sessionToken;
        this.guesses = new ArrayList<>();
        this.startedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public List<Integer> getGuesses() {
        return guesses;
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

    public Instant getStartedAt() {
        return startedAt;
    }

    public int getGuessCount() {
        return guesses.size();
    }
}
