package org.example.learning_service.presentation.http.v1.enrollment.leave_course.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Пользователь покидает курс: удаляются зачисление, пройденные уроки и связанный сертификат при наличии")
public record LeaveCourseRequest(
        @Schema(description = "Идентификатор пользователя", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID userId,

        @Schema(description = "Идентификатор курса", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID courseId
) {
}
