package org.example.learning_service.application.interactors.enrollment.complete_lesson;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompleteLessonCommand(
        UUID userId,
        UUID courseId,
        UUID lessonId,
        LocalDateTime completedAt
) {
}
