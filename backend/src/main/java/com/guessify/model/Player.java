package com.guessify.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Player {
    private final String id;
    private final String nickname;
    private final String sessionToken;
    private final List<Integer> guesses;
    private final Instant joinedAt;
    private boolean finished;
    private Instant finishedAt;
    private long elapsedMs;

    public Player(String nickname, String sessionToken) {
        this(UUID.randomUUID().toString(), nickname, sessionToken);
    }

    public Player(String id, String nickname, String sessionToken) {
        this.id = id;
        this.nickname = nickname;
        this.sessionToken = sessionToken;
        this.guesses = new ArrayList<>();
        this.joinedAt = Instant.now();
        this.finished = false;
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

    public Instant getJoinedAt() {
        return joinedAt;
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

    public void resetForRematch() {
        guesses.clear();
        finished = false;
        finishedAt = null;
        elapsedMs = 0;
    }
}
