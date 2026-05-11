package org.example.user_service.application.interactors.user.change_email;

import java.util.UUID;

public record ChangeEmailCommand(UUID id, String oldEmail, String newEmail) {
}
