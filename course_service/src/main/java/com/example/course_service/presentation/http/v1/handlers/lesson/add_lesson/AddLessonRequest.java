package com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Payload for creating a lesson")
public record AddLessonRequest(
        @Schema(description = "Parent course identifier", example = "2f5e6597-dbcd-4e8e-b3f7-2b3715628dca")
        UUID courseId,
        @Schema(description = "Parent module identifier", example = "ca3f2123-ef85-4f8a-9ef4-f45a277fa711")
        UUID moduleId,
        @Schema(description = "Lesson type", allowableValues = {"theory", "quiz", "coding"}, example = "theory")
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
