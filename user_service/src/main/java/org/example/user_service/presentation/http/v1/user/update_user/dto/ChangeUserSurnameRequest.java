package org.example.user_service.presentation.http.v1.user.update_user.dto;

import java.util.UUID;

public record ChangeUserSurnameRequest(UUID id, String newSurname) {
}
