package com.guessify.util;

import com.guessify.config.GuessifyProperties;
import com.guessify.model.Difficulty;
import com.guessify.model.GuessResult;
import com.guessify.model.Warmth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class GameLogicTest {

    private GameLogic gameLogic;

    @BeforeEach
    void setUp() {
        GuessifyProperties props = new GuessifyProperties(
                new GuessifyProperties.Cors("http://localhost:5173"),
                new GuessifyProperties.Room(10, 6, 24),
                new GuessifyProperties.RateLimit(2, 120),
                new GuessifyProperties.Nickname(20),
                new GuessifyProperties.Security(24, 50, false, "test-secret")
        );
        gameLogic = new GameLogic(props);
    }

    @Test
    void generatesDeterministicNumberFromSeed() {
        long a = gameLogic.generateSecretNumber(Difficulty.EASY, 12345L);
        long b = gameLogic.generateSecretNumber(Difficulty.EASY, 12345L);
        assertEquals(a, b);
        assertTrue(a >= 1 && a <= 100);
    }

    @Test
    void evaluatesGuessCorrectly() {
        var outcome = gameLogic.evaluateGuess(50, 50, Difficulty.EASY);
        assertEquals(GuessResult.CORRECT, outcome.result());
        assertEquals(Warmth.CORRECT, outcome.warmth());
    }

    @Test
    void generatesUniqueCodes() {
        String code = gameLogic.generateCode();
        assertEquals(6, code.length());
        assertTrue(code.matches("[A-HJ-NP-Z2-9]+"));
    }

    @Test
    void dailySeedDependsOnServerSecret() {
        LocalDate date = LocalDate.of(2026, 6, 28);
        GuessifyProperties secretA = propsWithDailySecret("secret-a");
        GuessifyProperties secretB = propsWithDailySecret("secret-b");
        long seedA = new GameLogic(secretA).dailySeed(Difficulty.EASY, date);
        long seedB = new GameLogic(secretB).dailySeed(Difficulty.EASY, date);
        assertNotEquals(seedA, seedB);
    }

    private GuessifyProperties propsWithDailySecret(String dailySecret) {
        return new GuessifyProperties(
                new GuessifyProperties.Cors("http://localhost:5173"),
                new GuessifyProperties.Room(10, 6, 24),
                new GuessifyProperties.RateLimit(2, 120),
                new GuessifyProperties.Nickname(20),
                new GuessifyProperties.Security(24, 50, false, dailySecret)
        );
    }
}
