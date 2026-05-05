package org.example.api_gateway_authz_service.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Registration response")
public record RegisterResponse(
        @Schema(description = "Created user identifier")
        UUID id
) {
}
