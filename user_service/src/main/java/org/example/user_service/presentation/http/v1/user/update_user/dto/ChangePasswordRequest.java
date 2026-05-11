package org.example.user_service.presentation.http.v1.user.update_user.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {
}
