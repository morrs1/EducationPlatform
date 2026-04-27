package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReadCourseByIdResponse(
        UUID authorId,
        String title,
        String shortDescription,
        String description,
        String difficulty,
        String languageCode,
        Integer estimatedMinutes,
        List<ModuleResponse> structure,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<TagResponse> tags
) {
}
