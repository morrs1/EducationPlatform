package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Lesson preview stored inside course structure")
public record LessonPreviewResponse(
        @Schema(description = "Lesson identifier", example = "fce5d5d5-5156-4a86-b2ab-c49c6ab98bb1")
        UUID id,
        @Schema(description = "Lesson type", example = "theory")
        String type,
        @Schema(description = "Lesson title", example = "Variables")
        String title,
        @Schema(description = "Lesson position inside module", example = "1")
        Integer position,
        @Schema(description = "Estimated duration in minutes", example = "15")
        Integer estimatedMinutes,
        @Schema(description = "Whether the lesson is available as preview", example = "true")
        Boolean isPreview
) {
}
