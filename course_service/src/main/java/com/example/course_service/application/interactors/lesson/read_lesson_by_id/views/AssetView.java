package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssetView(
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
