package org.example.user_service.presentation.http.v1.user.read_by_id.dto;

public record ReadUserByIdResponse(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userProfilePhotoLink
) {
}
