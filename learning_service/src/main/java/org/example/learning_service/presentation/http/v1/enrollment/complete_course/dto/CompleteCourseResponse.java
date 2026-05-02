package org.example.learning_service.presentation.http.v1.enrollment.complete_course.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Зачисление после перевода курса в статус completed")
public record CompleteCourseResponse(
        @Schema(description = "Идентификатор зачисления") UUID enrollmentId,
        @Schema(description = "Пользователь") UUID userId,
        @Schema(description = "Курс") UUID courseId,
        @Schema(description = "Статус") String enrollmentStatus,
        @Schema(description = "Время завершения") LocalDateTime completedAt
) {
}
