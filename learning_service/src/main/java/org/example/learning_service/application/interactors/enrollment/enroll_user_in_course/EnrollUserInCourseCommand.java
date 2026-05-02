package org.example.learning_service.application.interactors.enrollment.enroll_user_in_course;

import java.util.UUID;

public record EnrollUserInCourseCommand(
        UUID userId,
        UUID courseId
) {
}
