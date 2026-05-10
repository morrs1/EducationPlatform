package org.example.user_service.presentation.http.v1.user.auth.dto;

import java.util.UUID;

public record AuthenticatedUserResponse(
        UUID id,
        String email,
        String role,
        String userStatus
) {
}
