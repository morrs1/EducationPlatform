package org.example.api_gateway_authz_service.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Registration payload")
public record RegisterRequest(
        @Schema(description = "Surname", example = "Ivanov")
        String surname,
        @Schema(description = "Name", example = "Ivan")
        String name,
        @Schema(description = "Patronymic", example = "Ivanovich")
        String patronymic,
        @Schema(description = "User status", example = "STUDENT")
        String userStatus,
        @Schema(description = "User email", example = "user@example.com")
        String email,
        @Schema(description = "User password", example = "password123")
        String password,
        @Schema(description = "Profile photo URL", example = "https://example.com/photo.png")
        String profilePhotoLink
) {
}
