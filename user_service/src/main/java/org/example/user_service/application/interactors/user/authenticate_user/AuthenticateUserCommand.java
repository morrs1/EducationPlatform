package org.example.user_service.application.interactors.user.authenticate_user;

public record AuthenticateUserCommand(String email, String password) {
}
