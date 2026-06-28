package com.guessify.security;

import java.time.Instant;

public record SessionBinding(
        SessionScope scope,
        String resourceId,
        String subjectId,
        Instant expiresAt
) {
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
