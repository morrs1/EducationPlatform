package org.example.user_service.application.interactors.user.change_password;

import java.util.UUID;

public record ChangePasswordCommand(UUID id, String oldPassword, String newPassword) {
}
