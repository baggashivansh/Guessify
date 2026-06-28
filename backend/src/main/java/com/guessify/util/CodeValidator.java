package com.guessify.util;

import com.guessify.exception.GuessifyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class CodeValidator {

    private static final Pattern RESOURCE_CODE = Pattern.compile("^[A-HJ-NP-Z2-9]{6}$");
    private static final Pattern DIFFICULTY = Pattern.compile("^(EASY|MEDIUM|HARD)$");

    public String normalizeResourceCode(String code) {
        if (code == null || code.isBlank()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_CODE", "Invalid resource code");
        }
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        if (!RESOURCE_CODE.matcher(normalized).matches()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_CODE", "Invalid resource code format");
        }
        return normalized;
    }

    public void validateDifficultyPath(String difficulty) {
        if (difficulty == null || !DIFFICULTY.matcher(difficulty).matches()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_DIFFICULTY", "Invalid difficulty");
        }
    }

    public void validateSessionToken(String token) {
        if (token == null || token.isBlank() || token.length() < 32 || token.length() > 128) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid session token");
        }
        if (!token.matches("^[A-Za-z0-9_-]+$")) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid session token");
        }
    }

    public void validatePlayerId(String playerId) {
        if (playerId == null || playerId.isBlank() || playerId.length() > 64) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid player id");
        }
        if (!playerId.matches("^[0-9a-fA-F-]{36}$")) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid player id");
        }
    }
}
