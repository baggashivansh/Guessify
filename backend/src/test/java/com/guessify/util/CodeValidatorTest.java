package com.guessify.util;

import com.guessify.exception.GuessifyException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CodeValidatorTest {

    private CodeValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CodeValidator();
    }

    @Test
    void acceptsValidResourceCode() {
        assertEquals("ABC234", validator.normalizeResourceCode("abc234"));
    }

    @Test
    void rejectsInvalidCharacters() {
        assertThrows(GuessifyException.class, () -> validator.normalizeResourceCode("abc12!"));
    }

    @Test
    void rejectsWrongLength() {
        assertThrows(GuessifyException.class, () -> validator.normalizeResourceCode("ABC12"));
    }

    @Test
    void rejectsAmbiguousDigits() {
        assertThrows(GuessifyException.class, () -> validator.normalizeResourceCode("ABC103"));
    }

    @Test
    void validatesSessionTokenFormat() {
        String token = SecureCompare.generateToken();
        assertDoesNotThrow(() -> validator.validateSessionToken(token));
    }

    @Test
    void rejectsShortSessionToken() {
        assertThrows(GuessifyException.class, () -> validator.validateSessionToken("short"));
    }

    @Test
    void rejectsTamperedSessionToken() {
        assertThrows(GuessifyException.class, () -> validator.validateSessionToken("bad token with spaces!"));
    }
}
