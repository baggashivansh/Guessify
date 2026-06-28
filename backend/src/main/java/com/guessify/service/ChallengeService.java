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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChallengeService {

    private final Map<String, Challenge> challenges = new ConcurrentHashMap<>();
    private final Map<String, ChallengeAttempt> activeAttempts = new ConcurrentHashMap<>();
    private final GameLogic gameLogic;
    private final InputSanitizer sanitizer;
    private final RateLimitService rateLimitService;
    private final SecureSessionService secureSessionService;
    private final CodeValidator codeValidator;
    private final GuessifyProperties properties;
    private final String frontendBaseUrl;

    public ChallengeService(GameLogic gameLogic, InputSanitizer sanitizer, RateLimitService rateLimitService,
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

    public Dtos.ChallengeCreatedResponse createFromSolo(SoloSession session) {
        return saveChallenge(session.getDifficulty(), session.getSecretNumber(), session.getSeed(),
                session.getNickname(), session.getGuessCount(), session.getElapsedMs());
    }

    private Dtos.ChallengeCreatedResponse saveChallenge(Difficulty difficulty, long secret, long seed,
                                                        String nickname, int guesses, long timeMs) {
        String code = generateUniqueCode();
        Instant expires = Instant.now().plus(30, ChronoUnit.DAYS);
        Challenge challenge = new Challenge(code, difficulty, secret, seed, nickname, guesses, timeMs, expires);
        challenges.put(code, challenge);
        return new Dtos.ChallengeCreatedResponse(code, frontendBaseUrl + "/challenge/" + code);
    }

    public Dtos.ChallengeInfoResponse getChallenge(String code) {
        rateLimitService.checkRequest("challenge-lookup-" + code);
        Challenge challenge = getActiveChallenge(code);
        return new Dtos.ChallengeInfoResponse(
                challenge.getCode(),
                challenge.getDifficulty(),
                challenge.getCreatorNickname(),
                challenge.getCreatorGuesses(),
                challenge.getCreatorTimeMs(),
                frontendBaseUrl + "/challenge/" + challenge.getCode(),
                challenge.getAttempts().size()
        );
    }

    public Dtos.PlayerTokenResponse startChallenge(String code, Dtos.StartChallengeRequest request) {
        rateLimitService.checkRequest("start-challenge-" + code);
        Challenge challenge = getActiveChallenge(code);
        String nickname = sanitizer.sanitizeNickname(request.nickname());

        String attemptId = UUID.randomUUID().toString();
        String attemptToken = secureSessionService.issue(SessionScope.CHALLENGE, code, attemptId);
        ChallengeAttempt attempt = new ChallengeAttempt(attemptId, nickname, attemptToken);
        challenge.getAttempts().add(attempt);
        activeAttempts.put(attempt.getSessionToken(), attempt);
        storeChallengeAttempt(code, attempt);

        return new Dtos.PlayerTokenResponse(attempt.getId(), attempt.getSessionToken(), attempt.getNickname());
    }

    public Dtos.GuessResponse submitGuess(String code, String sessionToken, Dtos.GuessRequest request) {
        Challenge challenge = getActiveChallenge(code);
        ChallengeAttempt attempt = resolveAttempt(code, sessionToken);
        rateLimitService.checkGuess("challenge-" + attempt.getId());

        if (attempt.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "ALREADY_FINISHED", "Challenge already completed");
        }

        if (attempt.getGuessCount() >= properties.security().maxGuessesPerGame()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "MAX_GUESSES", "Maximum guesses reached");
        }

        int guess = request.value();
        Difficulty diff = challenge.getDifficulty();
        if (!diff.isInRange(guess)) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "OUT_OF_RANGE",
                    "Guess must be between " + diff.getMin() + " and " + diff.getMax());
        }

        attempt.getGuesses().add(guess);
        GameLogic.GuessOutcome outcome = gameLogic.evaluateGuess(guess, challenge.getSecretNumber(), diff);
        boolean finished = outcome.result() == GuessResult.CORRECT;
        Long elapsed = null;

        if (finished) {
            attempt.setFinished(true);
            attempt.setFinishedAt(Instant.now());
            elapsed = ChronoUnit.MILLIS.between(attempt.getStartedAt(), attempt.getFinishedAt());
            attempt.setElapsedMs(elapsed);
            activeAttempts.remove(sessionToken);
        }

        Integer secret = finished ? (int) challenge.getSecretNumber() : null;
        return new Dtos.GuessResponse(outcome.result(), outcome.warmth(), attempt.getGuessCount(),
                finished, elapsed, secret);
    }

    public Dtos.GameResultResponse getChallengeResult(String code, String sessionToken) {
        Challenge challenge = getActiveChallenge(code);
        ChallengeAttempt attempt = resolveAttempt(code, sessionToken);
        if (!attempt.isFinished()) {
            throw new GuessifyException(HttpStatus.CONFLICT, "NOT_FINISHED", "Complete the challenge first");
        }

        boolean beatCreator = attempt.getGuessCount() < challenge.getCreatorGuesses()
                || (attempt.getGuessCount() == challenge.getCreatorGuesses()
                && attempt.getElapsedMs() < challenge.getCreatorTimeMs());

        List<Dtos.LeaderboardEntry> board = List.of(
                new Dtos.LeaderboardEntry(challenge.getCreatorNickname(), challenge.getCreatorGuesses(),
                        challenge.getCreatorTimeMs(), 1, !beatCreator),
                new Dtos.LeaderboardEntry(attempt.getNickname(), attempt.getGuessCount(),
                        attempt.getElapsedMs(), beatCreator ? 1 : 2, beatCreator)
        );

        return new Dtos.GameResultResponse(
                board.stream().sorted(Comparator.comparingInt(Dtos.LeaderboardEntry::rank)).toList(),
                (int) challenge.getSecretNumber(),
                true
        );
    }

    public void cleanupExpired() {
        challenges.entrySet().removeIf(e -> e.getValue().isExpired());
    }

    private Challenge getActiveChallenge(String code) {
        String normalized = codeValidator.normalizeResourceCode(code);
        Challenge challenge = challenges.get(normalized);
        if (challenge == null) {
            throw new GuessifyException(HttpStatus.NOT_FOUND, "CHALLENGE_NOT_FOUND", "Challenge not found");
        }
        if (challenge.isExpired()) {
            challenges.remove(normalized);
            throw new GuessifyException(HttpStatus.GONE, "CHALLENGE_EXPIRED", "This challenge has expired");
        }
        return challenge;
    }

    private ChallengeAttempt resolveAttempt(String code, String sessionToken) {
        codeValidator.validateSessionToken(sessionToken);
        String normalized = codeValidator.normalizeResourceCode(code);
        String boundCode = attemptToChallenge.get(sessionToken);
        if (boundCode == null || !SecureCompare.equals(boundCode, normalized)) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "SESSION_MISMATCH",
                    "Session is not valid for this challenge");
        }
        secureSessionService.require(sessionToken, SessionScope.CHALLENGE, normalized);
        ChallengeAttempt attempt = activeAttempts.get(sessionToken);
        if (attempt == null) {
            attempt = findAttemptInChallenge(normalized, sessionToken);
        }
        if (attempt == null) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid session");
        }
        return attempt;
    }

    private final Map<String, String> attemptToChallenge = new ConcurrentHashMap<>();

    private void storeChallengeAttempt(String code, ChallengeAttempt attempt) {
        attemptToChallenge.put(attempt.getSessionToken(), code.toUpperCase(Locale.ROOT));
    }

    private ChallengeAttempt findAttemptInChallenge(String code, String sessionToken) {
        Challenge challenge = challenges.get(code.toUpperCase(Locale.ROOT));
        if (challenge == null) {
            return null;
        }
        return challenge.getAttempts().stream()
                .filter(a -> SecureCompare.equals(a.getSessionToken(), sessionToken))
                .findFirst()
                .orElse(null);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = gameLogic.generateCode();
        } while (challenges.containsKey(code));
        return code;
    }
}
