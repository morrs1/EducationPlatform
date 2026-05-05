package org.example.user_service.presentation.http.v1.user.create.dto;

public record CreateUserRequest(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userPassword,
        String userProfilePhotoLink
) {
}
