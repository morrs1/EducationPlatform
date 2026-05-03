package org.example.learning_service.presentation.http.v1.enrollment.enroll.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Созданное зачисление")
public record EnrollUserInCourseResponse(
        @Schema(description = "Идентификатор зачисления")
        UUID enrollmentId,
        @Schema(description = "Пользователь")
        UUID userId,
        @Schema(description = "Курс")
        UUID courseId,
        @Schema(description = "Статус (после записи всегда in_progress)")
        String enrollmentStatus
) {
}
