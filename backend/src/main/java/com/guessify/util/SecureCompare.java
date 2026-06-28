package com.guessify.util;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class SecureCompare {

    private static final SecureRandom RANDOM = new SecureRandom();

    private SecureCompare() {}

    public static boolean equals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return MessageDigest.isEqual(a.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                b.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    public static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
