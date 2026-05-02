package org.example.learning_service.application.interactors.enrollment.user_course_lists;

import java.util.List;
import java.util.UUID;

public record UserCoursesListView(
        UUID userId,
        List<UUID> courses
) {
}
