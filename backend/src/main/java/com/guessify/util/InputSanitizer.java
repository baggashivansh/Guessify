package com.guessify.util;

import com.guessify.config.GuessifyProperties;
import com.guessify.exception.GuessifyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class InputSanitizer {

    private static final Pattern NICKNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9 _\\-]{1,20}$");

    private final GuessifyProperties properties;

    public InputSanitizer(GuessifyProperties properties) {
        this.properties = properties;
    }

    public String sanitizeNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_NICKNAME", "Nickname is required");
        }
        String trimmed = nickname.trim();
        if (trimmed.length() > properties.nickname().maxLength()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_NICKNAME",
                    "Nickname must be at most " + properties.nickname().maxLength() + " characters");
        }
        if (!NICKNAME_PATTERN.matcher(trimmed).matches()) {
            throw new GuessifyException(HttpStatus.BAD_REQUEST, "INVALID_NICKNAME",
                    "Nickname may only contain letters, numbers, spaces, hyphens, and underscores");
        }
        return trimmed;
    }
}
