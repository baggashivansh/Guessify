package com.guessify.model;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public class Room {
    private final String code;
    private String hostPlayerId;
    private Difficulty difficulty;
    private RoomStatus status;
    private long secretNumber;
    private long seed;
    private final Map<String, Player> players;
    private final Instant createdAt;
    private final Instant expiresAt;
    private Instant gameStartedAt;
    private int round;

    public Room(String code, String hostPlayerId, Difficulty difficulty, long secretNumber, long seed,
                Instant expiresAt) {
        this.code = code;
        this.hostPlayerId = hostPlayerId;
        this.difficulty = difficulty;
        this.status = RoomStatus.WAITING;
        this.secretNumber = secretNumber;
        this.seed = seed;
        this.players = new LinkedHashMap<>();
        this.createdAt = Instant.now();
        this.expiresAt = expiresAt;
        this.round = 1;
    }

    public String getCode() {
        return code;
    }

    public String getHostPlayerId() {
        return hostPlayerId;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public long getSecretNumber() {
        return secretNumber;
    }

    public long getSeed() {
        return seed;
    }

    public Map<String, Player> getPlayers() {
        return players;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getGameStartedAt() {
        return gameStartedAt;
    }

    public void setGameStartedAt(Instant gameStartedAt) {
        this.gameStartedAt = gameStartedAt;
    }

    public int getRound() {
        return round;
    }

    public void setHostPlayerId(String hostPlayerId) {
        this.hostPlayerId = hostPlayerId;
    }

    public void setSecretNumber(long secretNumber) {
        this.secretNumber = secretNumber;
    }

    public void setSeed(long seed) {
        this.seed = seed;
    }

    public void resetForRematch(long newSecret, long newSeed) {
        this.secretNumber = newSecret;
        this.seed = newSeed;
        this.status = RoomStatus.PLAYING;
        this.gameStartedAt = Instant.now();
        this.round++;
        for (Player player : players.values()) {
            player.resetForRematch();
        }
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean allPlayersFinished() {
        return players.values().stream().allMatch(Player::isFinished);
    }
}
