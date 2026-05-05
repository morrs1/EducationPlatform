package org.example.user_service.application.interactors.user.create_user;

public record CreateUserCommand(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userPassword,
        String userProfilePhotoLink
) {
}
