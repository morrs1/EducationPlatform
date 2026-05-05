package org.example.api_gateway_authz_service.auth.dto;

public record RegisterRequest(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String email,
        String password,
        String profilePhotoLink
) {
}
