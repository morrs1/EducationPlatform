package org.example.api_gateway_authz_service.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.example.api_gateway_authz_service.auth.AuthenticatedUser;

@Schema(description = "Login response with gateway JWT")
public record LoginResponse(
        @Schema(description = "JWT access token")
        String accessToken,
        @Schema(description = "Token type", example = "Bearer")
        String tokenType,
        @Schema(description = "Token lifetime in seconds", example = "900")
        long expiresIn,
        @Schema(description = "Authenticated user data")
        AuthenticatedUser user
) {
}
