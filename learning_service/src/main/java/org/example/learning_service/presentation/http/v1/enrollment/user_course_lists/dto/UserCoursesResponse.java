package org.example.learning_service.presentation.http.v1.enrollment.user_course_lists.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Пользователь и список идентификаторов курсов")
public record UserCoursesResponse(
        @Schema(description = "Идентификатор пользователя")
        UUID userId,
        @Schema(description = "Идентификаторы курсов")
        List<UUID> courses
) {
}
