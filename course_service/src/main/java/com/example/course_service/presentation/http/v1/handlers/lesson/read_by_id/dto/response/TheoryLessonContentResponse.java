package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Theory lesson content")
public record TheoryLessonContentResponse(
        @Schema(description = "Theory lesson markdown", example = "# Variables\nTheory lesson body")
        String markdown
) implements LessonContentResponse {
}
