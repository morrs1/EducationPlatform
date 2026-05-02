package org.example.learning_service.presentation.http.v1.enrollment.enroll.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Зачисление пользователя на курс")
public record EnrollUserInCourseRequest(
        @Schema(description = "Идентификатор пользователя", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID userId,

        @Schema(description = "Идентификатор курса в course-service", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID courseId
) {
}
