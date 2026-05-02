package org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Прогресс по курсу: зачисление и список пройденных уроков")
public record ReadCompletedLessonsForCourseResponse(
        @Schema(description = "Курс")
        UUID courseId,
        @Schema(description = "Пользователь")
        UUID userId,
        @Schema(description = "Идентификатор зачисления")
        UUID enrollmentId,
        @Schema(description = "Статус зачисления (строка из домена)")
        String enrollmentStatus,
        @Schema(description = "Пройденные уроки, отсортированные по времени завершения")
        List<CompletedLessonResponse> completedLessons
) {
}
