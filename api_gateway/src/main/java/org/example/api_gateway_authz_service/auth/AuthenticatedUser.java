package org.example.api_gateway_authz_service.auth;

import java.util.UUID;

public record AuthenticatedUser(
        UUID id,
        String email,
        String role,
        String userStatus
) {
}
