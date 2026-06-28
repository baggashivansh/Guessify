package com.guessify.service;

import com.guessify.config.GuessifyProperties;
import com.guessify.dto.Dtos;
import com.guessify.exception.GuessifyException;
import com.guessify.model.*;
import com.guessify.security.SecureSessionService;
import com.guessify.security.SessionScope;
import com.guessify.util.CodeValidator;
import com.guessify.util.GameLogic;
import com.guessify.util.InputSanitizer;
import com.guessify.util.RateLimitService;
import com.guessify.util.SecureCompare;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final GameLogic gameLogic;
    private final InputSanitizer sanitizer;
    private final RateLimitService rateLimitService;
    private final SecureSessionService secureSessionService;
    private final CodeValidator codeValidator;
    private final GuessifyProperties properties;
    private final String frontendBaseUrl;

    public RoomService(GameLogic gameLogic, InputSanitizer sanitizer, RateLimitService rateLimitService,
                       SecureSessionService secureSessionService, CodeValidator codeValidator,
                       GuessifyProperties properties,
                       @Value("${guessify.frontend-base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.gameLogic = gameLogic;
        this.sanitizer = sanitizer;
        this.rateLimitService = rateLimitService;
        this.secureSessionService = secureSessionService;
        this.codeValidator = codeValidator;
        this.properties = properties;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public Dtos.CreateRoomResponse createRoom(Dtos.CreateRoomRequest request) {
        rateLimitService.checkRequest("create-room");
        String nickname = sanitizer.sanitizeNickname(request.nickname());
        String code = generateUniqueCode();
        long seed = System.nanoTime();
        long secret = gameLogic.generateSecretNumber(request.difficulty(), seed);
        Instant expires = Instant.now().plus(properties.room().ttlHours(), ChronoUnit.HOURS);

        String hostId = UUID.randomUUID().toString();
        String hostToken = secureSessionService.issue(SessionScope.PARTY, code, hostId);
        Player host = new Player(hostId, nickname, hostToken);
        Room room = new Room(code, host.getId(), request.difficulty(), secret, seed, expires);
        room.getPlayers().put(host.getId(), host);
        rooms.put(code, room);

        return new Dtos.CreateRoomResponse(
                code,
                host.getId(),
                host.getSessionToken(),
                host.getNickname(),
                frontendBaseUrl + "/party/" + code
        );
    }

    public Dtos.PlayerTokenResponse joinRoom(String code, Dtos.JoinRoomRequest request) {
        rateLimitService.checkRequest("join-" + code);
        Room room = getActiveRoom(code);
        if (room.getStatus() != RoomStatus.WAITING) {
            throw new GuessifyException(HttpStatus.CONFLICT, "GAME_STARTED", "This game has already started");
        }
        if (room.getPlayers().size() >= properties.room().maxPlayers()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ROOM_FULL", "Room is full");
        }
        String nickname = sanitizer.sanitizeNickname(request.nickname());
        boolean duplicate = room.getPlayers().values().stream()
                .anyMatch(p -> p.getNickname().equalsIgnoreCase(nickname));
        if (duplicate) {
            throw new GuessifyException(HttpStatus.CONFLICT, "NICKNAME_TAKEN", "Nickname already taken in this room");
        }

        String playerId = UUID.randomUUID().toString();
        String playerToken = secureSessionService.issue(SessionScope.PARTY, code, playerId);
        Player player = new Player(playerId, nickname, playerToken);
        room.getPlayers().put(player.getId(), player);
        return new Dtos.PlayerTokenResponse(player.getId(), player.getSessionToken(), player.getNickname());
    }

    public Dtos.RoomResponse getRoom(String code) {
        rateLimitService.checkRequest("room-lookup-" + codeValidator.normalizeResourceCode(code));
        return toRoomResponse(getActiveRoom(code), null);
    }

    public Dtos.RoomResponse startGame(String code, String playerId, String sessionToken) {
        Room room = getActiveRoom(code);
        Player host = authenticatePlayer(room, playerId, sessionToken);
        if (!host.getId().equals(room.getHostPlayerId())) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "NOT_HOST", "Only the host can start the game");
        }
        if (room.getStatus() != RoomStatus.WAITING) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_STARTED", "Game already started");
        }
        if (room.getPlayers().size() < 1) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "NO_PLAYERS", "Need at least one player");
        }
        room.setStatus(RoomStatus.PLAYING);
        room.setGameStartedAt(Instant.now());
        return toRoomResponse(room, playerId);
    }

    public Dtos.GuessResponse submitGuess(String code, String playerId, String sessionToken, Dtos.GuessRequest request) {
        rateLimitService.checkGuess("room-" + playerId);
        Room room = getActiveRoom(code);
        Player player = authenticatePlayer(room, playerId, sessionToken);

        if (room.getStatus() != RoomStatus.PLAYING) {
            throw new GuessifyException(HttpStatus.CONFLICT, "GAME_NOT_ACTIVE", "Game is not in progress");
        }
        if (player.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_FINISHED", "You already finished this round");
        }

        if (player.getGuessCount() >= properties.security().maxGuessesPerGame()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "MAX_GUESSES",
                    "Maximum guesses reached for this round");
        }

        int guess = request.value();
        Difficulty diff = room.getDifficulty();
        if (!diff.isInRange(guess)) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "OUT_OF_RANGE",
                    "Guess must be between " + diff.getMin() + " and " + diff.getMax());
        }

        player.getGuesses().add(guess);
        GameLogic.GuessOutcome outcome = gameLogic.evaluateGuess(guess, room.getSecretNumber(), diff);
        boolean finished = outcome.result() == GuessResult.CORRECT;
        Long elapsed = null;

        if (finished) {
            player.setFinished(true);
            player.setFinishedAt(Instant.now());
            elapsed = ChronoUnit.MILLIS.between(room.getGameStartedAt(), player.getFinishedAt());
            player.setElapsedMs(elapsed);
        }

        if (room.allPlayersFinished()) {
            room.setStatus(RoomStatus.FINISHED);
        }

        Integer secret = finished ? (int) room.getSecretNumber() : null;
        return new Dtos.GuessResponse(outcome.result(), outcome.warmth(), player.getGuessCount(),
                finished, elapsed, secret);
    }

    public Dtos.GameResultResponse getResults(String code, String playerId, String sessionToken) {
        Room room = getActiveRoom(code);
        authenticatePlayer(room, playerId, sessionToken);
        if (room.getStatus() != RoomStatus.FINISHED && !room.getPlayers().get(playerId).isFinished()) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "RESULTS_LOCKED",
                    "Results are available after you finish the round");
        }
        return buildLeaderboard(room);
    }

    public Dtos.RoomResponse rematch(String code, String playerId, String sessionToken) {
        Room room = getActiveRoom(code);
        Player host = authenticatePlayer(room, playerId, sessionToken);
        if (!host.getId().equals(room.getHostPlayerId())) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "NOT_HOST", "Only the host can start a rematch");
        }

        long seed = System.nanoTime();
        long secret = gameLogic.generateSecretNumber(room.getDifficulty(), seed);
        room.resetForRematch(secret, seed);
        return toRoomResponse(room, playerId);
    }

    public void cleanupExpired() {
        rooms.entrySet().removeIf(e -> e.getValue().isExpired());
    }

    private Room getActiveRoom(String code) {
        String normalized = codeValidator.normalizeResourceCode(code);
        Room room = rooms.get(normalized);
        if (room == null) {
            throw new GuessifyException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found");
        }
        if (room.isExpired()) {
            rooms.remove(normalized);
            throw new GuessifyException(HttpStatus.GONE, "ROOM_EXPIRED", "This room has expired");
        }
        return room;
    }

    private Player authenticatePlayer(Room room, String playerId, String sessionToken) {
        codeValidator.validatePlayerId(playerId);
        codeValidator.validateSessionToken(sessionToken);
        secureSessionService.requireSubject(sessionToken, SessionScope.PARTY, room.getCode(), playerId);
        Player player = room.getPlayers().get(playerId);
        if (player == null || !SecureCompare.equals(player.getSessionToken(), sessionToken)) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid player session");
        }
        return player;
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = gameLogic.generateCode();
        } while (rooms.containsKey(code));
        return code;
    }

    private Dtos.RoomResponse toRoomResponse(Room room, String currentPlayerId) {
        List<Dtos.PlayerSummary> players = room.getPlayers().values().stream()
                .map(p -> new Dtos.PlayerSummary(
                        p.getId(),
                        p.getNickname(),
                        p.getGuessCount(),
                        p.isFinished(),
                        p.isFinished() ? p.getElapsedMs() : null,
                        null
                ))
                .collect(Collectors.toList());

        boolean canStart = currentPlayerId != null
                && currentPlayerId.equals(room.getHostPlayerId())
                && room.getStatus() == RoomStatus.WAITING;

        return new Dtos.RoomResponse(
                room.getCode(),
                room.getDifficulty(),
                room.getStatus(),
                room.getRound(),
                room.getHostPlayerId(),
                players,
                frontendBaseUrl + "/party/" + room.getCode(),
                canStart,
                properties.room().maxPlayers()
        );
    }

    private Dtos.GameResultResponse buildLeaderboard(Room room) {
        List<Player> finished = room.getPlayers().values().stream()
                .filter(Player::isFinished)
                .sorted(Comparator
                        .comparingInt(Player::getGuessCount)
                        .thenComparingLong(Player::getElapsedMs))
                .toList();

        List<Dtos.LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Player p : finished) {
            entries.add(new Dtos.LeaderboardEntry(
                    p.getNickname(),
                    p.getGuessCount(),
                    p.getElapsedMs(),
                    rank,
                    rank == 1
            ));
            rank++;
        }

        for (Player p : room.getPlayers().values()) {
            if (!p.isFinished()) {
                entries.add(new Dtos.LeaderboardEntry(
                        p.getNickname(),
                        p.getGuessCount(),
                        0,
                        -1,
                        false
                ));
            }
        }

        return new Dtos.GameResultResponse(entries, (int) room.getSecretNumber(), room.allPlayersFinished());
    }

    public Dtos.RoomResponse getRoomForPlayer(String code, String playerId, String sessionToken) {
        Room room = getActiveRoom(code);
        authenticatePlayer(room, playerId, sessionToken);
        return toRoomResponse(room, playerId);
    }
}
