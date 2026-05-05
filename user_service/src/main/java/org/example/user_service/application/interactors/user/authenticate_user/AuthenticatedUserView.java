package org.example.user_service.application.interactors.user.authenticate_user;

import java.util.UUID;

public record AuthenticatedUserView(
        UUID id,
        String email,
        String role,
        String userStatus
) {
}
