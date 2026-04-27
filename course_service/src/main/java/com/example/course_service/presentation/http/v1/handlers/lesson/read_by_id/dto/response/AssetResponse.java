package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        UUID courseId,
        UUID lessonId,
        String type,
        String storageKey,
        String publicUrl,
        String mimeType,
        Long sizeBytes,
        String originalFilename,
        String title,
        LocalDateTime createdAt
) {
}
