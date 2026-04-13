package org.example.user_service.presentation.http.v1.user.add_profile_photo;

public record AddProfilePhotoResponse(
        String bucket,
        String key,
        String url,
        String originalFilename,
        String contentType,
        long size
) {
}
