package com.guessify.security;

import com.guessify.config.GuessifyProperties;
import com.guessify.exception.GuessifyException;
import com.guessify.util.CodeValidator;
import com.guessify.util.SecureCompare;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SecureSessionServiceTest {

    private SecureSessionService service;

    @BeforeEach
    void setUp() {
        GuessifyProperties props = new GuessifyProperties(
                new GuessifyProperties.Cors("http://localhost:5173"),
                new GuessifyProperties.Room(10, 6, 24),
                new GuessifyProperties.RateLimit(2, 120),
                new GuessifyProperties.Nickname(20),
                new GuessifyProperties.Security(24, 50, false, "test-secret")
        );
        service = new SecureSessionService(props, new CodeValidator());
    }

    @Test
    void tokenWorksOnlyForBoundResource() {
        String token = service.issue(SessionScope.PARTY, "ABC234", "player-1");
        assertDoesNotThrow(() -> service.requireSubject(token, SessionScope.PARTY, "ABC234", "player-1"));
    }

    @Test
    void rejectsTokenUsedOnDifferentRoom() {
        String token = service.issue(SessionScope.PARTY, "ABC234", "player-1");
        GuessifyException ex = assertThrows(GuessifyException.class,
                () -> service.requireSubject(token, SessionScope.PARTY, "XYZ789", "player-1"));
        assertEquals("SESSION_MISMATCH", ex.getCode());
    }

    @Test
    void rejectsTokenUsedWithDifferentPlayer() {
        String token = service.issue(SessionScope.PARTY, "ABC234", "player-1");
        assertThrows(GuessifyException.class,
                () -> service.requireSubject(token, SessionScope.PARTY, "ABC234", "player-2"));
    }

    @Test
    void rejectsTokenUsedInWrongScope() {
        String token = service.issue(SessionScope.PARTY, "ABC234", "player-1");
        assertThrows(GuessifyException.class,
                () -> service.requireSubject(token, SessionScope.CHALLENGE, "ABC234", "player-1"));
    }

    @Test
    void rejectsUnknownToken() {
        assertThrows(GuessifyException.class,
                () -> service.require(SecureCompare.generateToken(), SessionScope.SOLO, "solo"));
    }
}
