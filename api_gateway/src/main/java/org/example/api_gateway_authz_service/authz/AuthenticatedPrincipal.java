package org.example.api_gateway_authz_service.authz;

import java.util.UUID;

public record AuthenticatedPrincipal(
        UUID id,
        String email,
        UserRole role,
        String userStatus
) {
}
