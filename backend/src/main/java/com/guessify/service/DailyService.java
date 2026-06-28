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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DailyService {

    private final Map<String, DailySession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> activeDailyByClient = new ConcurrentHashMap<>();
    private final Set<String> completedToday = ConcurrentHashMap.newKeySet();
    private final GameLogic gameLogic;
    private final InputSanitizer sanitizer;
    private final RateLimitService rateLimitService;
    private final SecureSessionService secureSessionService;
    private final CodeValidator codeValidator;
    private final GuessifyProperties properties;

    public DailyService(GameLogic gameLogic, InputSanitizer sanitizer, RateLimitService rateLimitService,
                        SecureSessionService secureSessionService, CodeValidator codeValidator,
                        GuessifyProperties properties) {
        this.gameLogic = gameLogic;
        this.sanitizer = sanitizer;
        this.rateLimitService = rateLimitService;
        this.secureSessionService = secureSessionService;
        this.codeValidator = codeValidator;
        this.properties = properties;
    }

    public Dtos.DailyInfoResponse getDailyInfo(Difficulty difficulty, String clientId) {
        validateClientId(clientId);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String key = dailyKey(today, difficulty, clientId);
        return new Dtos.DailyInfoResponse(
                difficulty,
                today.toString(),
                completedToday.contains(key),
                difficulty.getMin(),
                difficulty.getMax()
        );
    }

    public Dtos.PlayerTokenResponse startDaily(Difficulty difficulty, Dtos.StartDailyRequest request, String clientId) {
        validateClientId(clientId);
        rateLimitService.checkRequest("daily-start");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String completedKey = dailyKey(today, difficulty, clientId);
        if (completedToday.contains(completedKey)) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_PLAYED",
                    "You already completed today's puzzle for this difficulty");
        }

        String existingToken = activeDailyByClient.get(completedKey);
        if (existingToken != null) {
            DailySession existing = sessions.get(existingToken);
            if (existing != null && !existing.isFinished()) {
                return new Dtos.PlayerTokenResponse(existing.getId(), existingToken, existing.getNickname());
            }
        }

        String nickname = sanitizer.sanitizeNickname(request.nickname());
        long seed = gameLogic.dailySeed(difficulty, today);
        long secret = gameLogic.generateSecretNumber(difficulty, seed);
        String sessionId = UUID.randomUUID().toString();
        String token = secureSessionService.issue(SessionScope.DAILY, difficulty.name(), sessionId);
        DailySession session = new DailySession(sessionId, token, nickname, clientId, difficulty, secret);
        sessions.put(token, session);
        activeDailyByClient.put(completedKey, token);
        return new Dtos.PlayerTokenResponse(sessionId, token, nickname);
    }

    public Dtos.GuessResponse submitGuess(Difficulty difficulty, String sessionToken, Dtos.GuessRequest request,
                                          String clientId) {
        validateClientId(clientId);
        DailySession session = resolveSession(sessionToken, difficulty);
        if (!session.getClientId().equals(clientId)) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "SESSION_MISMATCH", "Client mismatch");
        }
        rateLimitService.checkGuess("daily-" + sessionToken);

        if (session.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_FINISHED", "Daily puzzle already completed");
        }
        if (session.getGuessCount() >= properties.security().maxGuessesPerGame()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "MAX_GUESSES", "Maximum guesses reached");
        }

        int guess = request.value();
        if (!difficulty.isInRange(guess)) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "OUT_OF_RANGE",
                    "Guess must be between " + difficulty.getMin() + " and " + difficulty.getMax());
        }

        session.getGuesses().add(guess);
        GameLogic.GuessOutcome outcome = gameLogic.evaluateGuess(guess, session.getSecretNumber(), difficulty);
        boolean finished = outcome.result() == GuessResult.CORRECT;
        Long elapsed = null;

        if (finished) {
            session.setFinished(true);
            session.setFinishedAt(Instant.now());
            elapsed = ChronoUnit.MILLIS.between(session.getStartedAt(), session.getFinishedAt());
            session.setElapsedMs(elapsed);
            LocalDate today = LocalDate.now(ZoneOffset.UTC);
            String completedKey = dailyKey(today, difficulty, clientId);
            completedToday.add(completedKey);
            activeDailyByClient.remove(completedKey);
            secureSessionService.revoke(sessionToken);
            sessions.remove(sessionToken);
        }

        Integer secret = finished ? (int) session.getSecretNumber() : null;
        return new Dtos.GuessResponse(outcome.result(), outcome.warmth(), session.getGuessCount(),
                finished, elapsed, secret);
    }

    public void cleanupOldSessions() {
        sessions.entrySet().removeIf(e -> {
            DailySession s = e.getValue();
            return s.getStartedAt().isBefore(Instant.now().minus(2, ChronoUnit.HOURS));
        });
    }

    private DailySession resolveSession(String sessionToken, Difficulty difficulty) {
        codeValidator.validateSessionToken(sessionToken);
        secureSessionService.require(sessionToken, SessionScope.DAILY, difficulty.name());
        DailySession session = sessions.get(sessionToken);
        if (session == null) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid or expired session");
        }
        if (session.getDifficulty() != difficulty) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "SESSION_MISMATCH", "Difficulty mismatch");
        }
        return session;
    }

    private void validateClientId(String clientId) {
        if (clientId == null || clientId.isBlank() || clientId.length() > 64) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_CLIENT", "Invalid client id");
        }
        if (!clientId.matches("^[0-9a-fA-F-]{36}$")) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_CLIENT", "Invalid client id");
        }
    }

    private String dailyKey(LocalDate date, Difficulty difficulty, String clientId) {
        return date + ":" + difficulty.name() + ":" + clientId;
    }
}
