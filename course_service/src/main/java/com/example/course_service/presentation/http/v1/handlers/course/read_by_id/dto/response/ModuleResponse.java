package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import java.util.List;
import java.util.UUID;

public record ModuleResponse(
        UUID id,
        UUID courseId,
        String title,
        String description,
        Integer position,
        Integer estimatedMinutes,
        List<LessonPreviewResponse> lessons
) {
}
