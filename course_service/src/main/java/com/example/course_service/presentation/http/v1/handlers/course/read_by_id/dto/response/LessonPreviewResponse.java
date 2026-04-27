package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import java.util.UUID;

public record LessonPreviewResponse(
        UUID id,
        String type,
        String title,
        Integer position,
        Integer estimatedMinutes,
        Boolean isPreview
) {
}
