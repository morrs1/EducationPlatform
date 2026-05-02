package org.example.learning_service.application.interactors.enrollment.complete_course;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompleteCourseView(
        UUID enrollmentId,
        UUID userId,
        UUID courseId,
        String enrollmentStatus,
        LocalDateTime completedAt
) {
}
