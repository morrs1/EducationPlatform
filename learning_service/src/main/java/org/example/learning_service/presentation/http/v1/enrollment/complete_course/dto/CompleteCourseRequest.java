package org.example.learning_service.presentation.http.v1.enrollment.complete_course.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Завершить курс по паре пользователь + курс")
public record CompleteCourseRequest(
        @Schema(description = "Пользователь", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID userId,

        @Schema(description = "Курс", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID courseId,

        @Schema(description = "Момент завершения (если не указан — текущее время сервера)")
        LocalDateTime completedAt
) {
}
