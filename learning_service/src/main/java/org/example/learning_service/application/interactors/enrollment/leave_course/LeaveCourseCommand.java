package org.example.learning_service.application.interactors.enrollment.leave_course;

import java.util.UUID;

public record LeaveCourseCommand(UUID userId, UUID courseId) {
}
