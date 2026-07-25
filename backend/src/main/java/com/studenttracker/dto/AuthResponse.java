package com.studenttracker.dto;

import java.time.Instant;
import java.util.Set;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserResponse user) {

    public record UserResponse(Long id, String email, String fullName, Set<String> roles) {
    }
}
