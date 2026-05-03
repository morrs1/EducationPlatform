package org.example.learning_service.application.interactors.enrollment.complete_lesson;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CompleteLessonView(
        UUID enrollmentId,
        UUID userId,
        UUID courseId,
        UUID lessonId,
        LocalDateTime completedAt,
        LocalDate activityDate
) {
}
