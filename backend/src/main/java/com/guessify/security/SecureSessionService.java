package com.guessify.security;

import com.guessify.config.GuessifyProperties;
import com.guessify.exception.GuessifyException;
import com.guessify.util.CodeValidator;
import com.guessify.util.SecureCompare;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SecureSessionService {

    private final Map<String, SessionBinding> bindings = new ConcurrentHashMap<>();
    private final GuessifyProperties properties;
    private final CodeValidator codeValidator;

    public SecureSessionService(GuessifyProperties properties, CodeValidator codeValidator) {
        this.properties = properties;
        this.codeValidator = codeValidator;
    }

    public String issue(SessionScope scope, String resourceId, String subjectId) {
        String normalizedResource = normalizeResource(scope, resourceId);
        String token = SecureCompare.generateToken();
        Instant expires = Instant.now().plus(properties.security().sessionTtlHours(), ChronoUnit.HOURS);
        bindings.put(token, new SessionBinding(scope, normalizedResource, subjectId, expires));
        return token;
    }

    public SessionBinding require(String token, SessionScope scope, String resourceId) {
        codeValidator.validateSessionToken(token);
        SessionBinding binding = bindings.get(token);
        if (binding == null) {
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid or expired session");
        }
        if (binding.isExpired()) {
            bindings.remove(token);
            throw new GuessifyException(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "Session has expired");
        }
        String normalizedResource = normalizeResource(scope, resourceId);
        if (binding.scope() != scope || !SecureCompare.equals(binding.resourceId(), normalizedResource)) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "SESSION_MISMATCH",
                    "Session is not valid for this resource");
        }
        return binding;
    }

    public void requireSubject(String token, SessionScope scope, String resourceId, String subjectId) {
        SessionBinding binding = require(token, scope, resourceId);
        if (!SecureCompare.equals(binding.subjectId(), subjectId)) {
            throw new GuessifyException(HttpStatus.FORBIDDEN, "SESSION_MISMATCH",
                    "Session does not match player identity");
        }
    }

    public void revoke(String token) {
        if (token != null) {
            bindings.remove(token);
        }
    }

    public void cleanupExpired() {
        bindings.entrySet().removeIf(e -> e.getValue().isExpired());
    }

    private String normalizeResource(SessionScope scope, String resourceId) {
        return switch (scope) {
            case PARTY, CHALLENGE -> codeValidator.normalizeResourceCode(resourceId);
            case SOLO -> "solo";
            case DAILY -> {
                codeValidator.validateDifficultyPath(resourceId);
                yield resourceId.toUpperCase();
            }
        };
    }
}
