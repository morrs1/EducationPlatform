package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReadLessonByIdResponse(
        UUID courseId,
        String type,
        String title,
        LessonContentResponse content,
        List<AssetResponse> assets,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
