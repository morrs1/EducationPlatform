package org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course;

import java.util.List;
import java.util.UUID;

public record ReadCompletedLessonsForCourseView(
        UUID courseId,
        UUID userId,
        UUID enrollmentId,
        String enrollmentStatus,
        List<CompletedLessonView> completedLessons
) {
}
