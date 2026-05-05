package org.example.api_gateway_authz_service.auth.dto;

import org.example.api_gateway_authz_service.auth.AuthenticatedUser;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        AuthenticatedUser user
) {
}
