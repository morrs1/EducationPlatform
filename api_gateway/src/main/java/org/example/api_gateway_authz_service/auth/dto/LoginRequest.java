package org.example.api_gateway_authz_service.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Login payload")
public record LoginRequest(
        @Schema(description = "User email", example = "user@example.com")
        String email,
        @Schema(description = "User password", example = "password123")
        String password
) {
}
