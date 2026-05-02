package org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompletedLessonView(
        UUID lessonId,
        LocalDateTime completedAt
) {
}
