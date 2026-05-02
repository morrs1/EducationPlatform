package org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Результат фиксации пройденного урока")
public record CompleteLessonResponse(
        @Schema(description = "Зачисление")
        UUID enrollmentId,
        @Schema(description = "Пользователь")
        UUID userId,
        @Schema(description = "Курс")
        UUID courseId,
        @Schema(description = "Урок")
        UUID lessonId,
        @Schema(description = "Момент прохождения")
        LocalDateTime completedAt,
        @Schema(description = "Календарный день, в который увеличен счётчик активности")
        LocalDate activityDate
) {
}
