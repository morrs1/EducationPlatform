package org.example.user_service.presentation.http.v1.user.auth.dto;

public record AuthenticateUserRequest(String email, String password) {
}
