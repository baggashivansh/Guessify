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
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SoloService {

    private final Map<String, SoloSession> sessions = new ConcurrentHashMap<>();
    private final GameLogic gameLogic;
    private final InputSanitizer sanitizer;
    private final RateLimitService rateLimitService;
    private final SecureSessionService secureSessionService;
    private final CodeValidator codeValidator;
    private final GuessifyProperties properties;
    private final ChallengeService challengeService;

    public SoloService(GameLogic gameLogic, InputSanitizer sanitizer, RateLimitService rateLimitService,
                       SecureSessionService secureSessionService, CodeValidator codeValidator,
                       GuessifyProperties properties, ChallengeService challengeService) {
        this.gameLogic = gameLogic;
        this.sanitizer = sanitizer;
        this.rateLimitService = rateLimitService;
        this.secureSessionService = secureSessionService;
        this.codeValidator = codeValidator;
        this.properties = properties;
        this.challengeService = challengeService;
    }

    public Dtos.PlayerTokenResponse start(Dtos.StartSoloRequest request) {
        rateLimitService.checkRequest("solo-start");
        String nickname = sanitizer.sanitizeNickname(request.nickname());
        long seed = System.nanoTime();
        long secret = gameLogic.generateSecretNumber(request.difficulty(), seed);
        String sessionId = UUID.randomUUID().toString();
        String token = secureSessionService.issue(SessionScope.SOLO, "solo", sessionId);
        SoloSession session = new SoloSession(sessionId, token, nickname, request.difficulty(), secret, seed);
        sessions.put(token, session);
        return new Dtos.PlayerTokenResponse(sessionId, token, nickname);
    }

    public Dtos.GuessResponse guess(String sessionToken, Dtos.GuessRequest request) {
        SoloSession session = resolve(sessionToken);
        rateLimitService.checkGuess("solo-" + sessionToken);

        if (session.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_FINISHED", "Game already completed");
        }
        if (session.getGuessCount() >= properties.security().maxGuessesPerGame()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "MAX_GUESSES", "Maximum guesses reached");
        }

        int guess = request.value();
        Difficulty diff = session.getDifficulty();
        if (!diff.isInRange(guess)) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "OUT_OF_RANGE",
                    "Guess must be between " + diff.getMin() + " and " + diff.getMax());
        }

        session.getGuesses().add(guess);
        GameLogic.GuessOutcome outcome = gameLogic.evaluateGuess(guess, session.getSecretNumber(), diff);
        boolean finished = outcome.result() == GuessResult.CORRECT;
        Long elapsed = null;

        if (finished) {
            session.setFinished(true);
            session.setFinishedAt(Instant.now());
            elapsed = ChronoUnit.MILLIS.between(session.getStartedAt(), session.getFinishedAt());
            session.setElapsedMs(elapsed);
        }

        Integer secret = finished ? (int) session.getSecretNumber() : null;
        return new Dtos.GuessResponse(outcome.result(), outcome.warmth(), session.getGuessCount(),
                finished, elapsed, secret);
    }

    public Dtos.ChallengeCreatedResponse createChallenge(String sessionToken) {
        SoloSession session = resolve(sessionToken);
        if (!session.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "NOT_FINISHED", "Finish the game before sharing");
        }
        return challengeService.createFromSolo(session);
    }

    public void cleanup() {
        sessions.entrySet().removeIf(e ->
                e.getValue().getStartedAt().isBefore(Instant.now().minus(2, ChronoUnit.HOURS)));
    }

    private SoloSession resolve(String sessionToken) {
        codeValidator.validateSessionToken(sessionToken);
        secureSessionService.require(sessionToken, SessionScope.SOLO, "solo");
        SoloSession session = sessions.get(sessionToken);
        if (session == null) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid or expired session");
        }
        return session;
    }
}
