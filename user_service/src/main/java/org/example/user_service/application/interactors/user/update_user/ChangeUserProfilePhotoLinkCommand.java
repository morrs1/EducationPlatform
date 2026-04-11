package org.example.user_service.application.interactors.user.update_user;

import java.util.UUID;

public record ChangeUserProfilePhotoLinkCommand(UUID id, String newProfilePhotoLink) {
}
