package org.example.user_service.application.interactors.user.update_user;

import java.util.UUID;

public record ChangeUserPatronymicCommand(UUID id, String newPatronymic) {
}
