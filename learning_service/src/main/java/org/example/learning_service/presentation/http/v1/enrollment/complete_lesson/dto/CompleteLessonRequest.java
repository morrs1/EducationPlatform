package org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Отметить урок как пройденный по зачислению (пользователь + курс)")
public record CompleteLessonRequest(
        @Schema(description = "Пользователь", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID userId,

        @Schema(description = "Курс", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID courseId,

        @Schema(description = "Урок", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID lessonId,

        @Schema(description = "Момент прохождения (если не указан — текущее время сервера; дата для активности берётся из этого поля)")
        LocalDateTime completedAt
) {
}
