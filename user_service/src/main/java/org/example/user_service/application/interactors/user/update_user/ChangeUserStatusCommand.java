package org.example.user_service.application.interactors.user.update_user;

import java.util.UUID;

public record ChangeUserStatusCommand(UUID id, String newStatus) {
}
