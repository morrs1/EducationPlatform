package org.example.learning_service.application.interactors.enrollment.complete_course;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompleteCourseCommand(
        UUID userId,
        UUID courseId,
        LocalDateTime completedAt
) {
}
