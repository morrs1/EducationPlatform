package org.example.learning_service.application.interactors.mappers;

import org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course.CompletedLessonView;
import org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course.ReadCompletedLessonsForCourseView;
import org.example.learning_service.application.interactors.enrollment.user_course_lists.UserCoursesListView;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.LessonCompletion;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Component
public class EnrollmentViewMapper {

    public UserCoursesListView toUserCoursesListView(UUID userId, List<Enrollment> enrollments) {
        List<UUID> courses = enrollments.stream()
                .map(Enrollment::getCourseId)
                .toList();
        return new UserCoursesListView(userId, courses);
    }

    public ReadCompletedLessonsForCourseView toReadCompletedLessonsView(Enrollment enrollment) {
        List<CompletedLessonView> lessons = enrollment.getLessonCompletions().stream()
                .sorted(Comparator.comparing(LessonCompletion::getCompletedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(lc -> new CompletedLessonView(lc.getLessonId(), lc.getCompletedAt()))
                .toList();
        return new ReadCompletedLessonsForCourseView(
                enrollment.getCourseId(),
                enrollment.getUserId(),
                enrollment.getId(),
                enrollment.getStatus().getValue(),
                lessons
        );
    }
}
