package org.example.user_service.application.interactors.user.read_user_by_id;

public record ReadUserByIdView(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userProfilePhotoLink,
        String role
) {
}
