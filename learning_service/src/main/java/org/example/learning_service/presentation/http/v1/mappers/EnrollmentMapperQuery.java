package org.example.learning_service.presentation.http.v1.mappers;

import org.example.learning_service.application.interactors.enrollment.complete_course.CompleteCourseView;
import org.example.learning_service.application.interactors.enrollment.complete_lesson.CompleteLessonView;
import org.example.learning_service.application.interactors.enrollment.enroll_user_in_course.EnrollUserInCourseView;
import org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course.ReadCompletedLessonsForCourseView;
import org.example.learning_service.application.interactors.enrollment.user_course_lists.UserCoursesListView;
import org.example.learning_service.presentation.http.v1.enrollment.complete_course.dto.CompleteCourseResponse;
import org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.dto.CompleteLessonResponse;
import org.example.learning_service.presentation.http.v1.enrollment.enroll.dto.EnrollUserInCourseResponse;
import org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.dto.CompletedLessonResponse;
import org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.dto.ReadCompletedLessonsForCourseResponse;
import org.example.learning_service.presentation.http.v1.enrollment.user_course_lists.dto.UserCoursesResponse;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapperQuery {

    public EnrollUserInCourseResponse toEnrollUserInCourseResponse(EnrollUserInCourseView view) {
        return new EnrollUserInCourseResponse(
                view.enrollmentId(),
                view.userId(),
                view.courseId(),
                view.enrollmentStatus()
        );
    }

    public CompleteCourseResponse toCompleteCourseResponse(CompleteCourseView view) {
        return new CompleteCourseResponse(
                view.enrollmentId(),
                view.userId(),
                view.courseId(),
                view.enrollmentStatus(),
                view.completedAt()
        );
    }

    public CompleteLessonResponse toCompleteLessonResponse(CompleteLessonView view) {
        return new CompleteLessonResponse(
                view.enrollmentId(),
                view.userId(),
                view.courseId(),
                view.lessonId(),
                view.completedAt(),
                view.activityDate()
        );
    }

    public UserCoursesResponse toUserCoursesResponse(UserCoursesListView view) {
        return new UserCoursesResponse(view.userId(), view.courses());
    }

    public ReadCompletedLessonsForCourseResponse toReadCompletedLessonsForCourseResponse(
            ReadCompletedLessonsForCourseView view
    ) {
        var lessons = view.completedLessons().stream()
                .map(l -> new CompletedLessonResponse(l.lessonId(), l.completedAt()))
                .toList();
        return new ReadCompletedLessonsForCourseResponse(
                view.courseId(),
                view.userId(),
                view.enrollmentId(),
                view.enrollmentStatus(),
                lessons
        );
    }
}
