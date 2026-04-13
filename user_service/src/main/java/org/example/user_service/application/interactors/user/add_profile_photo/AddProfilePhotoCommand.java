package org.example.user_service.application.interactors.user.add_profile_photo;

import java.util.UUID;

public record AddProfilePhotoCommand(
        UUID userId,
        String originalFileName,
        String contentType,
        long size,
        byte[] content
) {
}
