package com.guessify.service;

import com.guessify.config.GuessifyProperties;
import com.guessify.dto.Dtos;
import com.guessify.exception.GuessifyException;
import com.guessify.model.Difficulty;
import com.guessify.security.SecureSessionService;
import com.guessify.util.CodeValidator;
import com.guessify.util.GameLogic;
import com.guessify.util.InputSanitizer;
import com.guessify.util.RateLimitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DailyServiceTest {

    private static final String CLIENT = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    private DailyService dailyService;

    @BeforeEach
    void setUp() {
        GuessifyProperties props = new GuessifyProperties(
                new GuessifyProperties.Cors("http://localhost:5173"),
                new GuessifyProperties.Room(10, 6, 24),
                new GuessifyProperties.RateLimit(2, 120),
                new GuessifyProperties.Nickname(20),
                new GuessifyProperties.Security(24, 50, false, "test-daily-secret")
        );
        GameLogic gameLogic = new GameLogic(props);
        InputSanitizer sanitizer = new InputSanitizer(props);
        RateLimitService rateLimitService = new RateLimitService(props);
        SecureSessionService secureSessionService = new SecureSessionService(props, new CodeValidator());
        CodeValidator codeValidator = new CodeValidator();
        dailyService = new DailyService(gameLogic, sanitizer, rateLimitService,
                secureSessionService, codeValidator, props);
    }

    @Test
    void resumesExistingDailySessionInsteadOfStartingTwice() {
        Dtos.StartDailyRequest request = new Dtos.StartDailyRequest("Player");
        Dtos.PlayerTokenResponse first = dailyService.startDaily(Difficulty.EASY, request, CLIENT);
        Dtos.PlayerTokenResponse second = dailyService.startDaily(Difficulty.EASY, request, CLIENT);

        assertEquals(first.sessionToken(), second.sessionToken());
        assertEquals(first.playerId(), second.playerId());
    }

    @Test
    void rejectsGuessFromDifferentClient() {
        Dtos.PlayerTokenResponse session = dailyService.startDaily(
                Difficulty.EASY, new Dtos.StartDailyRequest("Player"), CLIENT);

        assertThrows(GuessifyException.class, () -> dailyService.submitGuess(
                Difficulty.EASY,
                session.sessionToken(),
                new Dtos.GuessRequest(50),
                "bbbbbbbb-cccc-dddd-eeee-ffffffffffff"
        ));
    }
}
