package org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Урок, отмеченный как пройденный в рамках зачисления")
public record CompletedLessonResponse(
        @Schema(description = "Идентификатор урока в course-service")
        UUID lessonId,
        @Schema(description = "Момент завершения урока")
        LocalDateTime completedAt
) {
}
