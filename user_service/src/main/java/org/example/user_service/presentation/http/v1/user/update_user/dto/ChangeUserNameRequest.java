package org.example.user_service.presentation.http.v1.user.update_user.dto;

import java.util.UUID;

public record ChangeUserNameRequest(UUID id, String newName) {
}
