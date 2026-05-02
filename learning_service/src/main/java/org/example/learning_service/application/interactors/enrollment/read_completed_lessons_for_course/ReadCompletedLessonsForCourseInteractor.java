package org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.application.interactors.mappers.EnrollmentViewMapper;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadCompletedLessonsForCourseInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final EnrollmentViewMapper enrollmentViewMapper;

    public ReadCompletedLessonsForCourseView readCompletedLessonsForCourse(UUID userId, UUID courseId) {
        return transactionManager.inTransaction(() ->
                enrollmentRepo.findFetchedByUserIdAndCourseId(userId, courseId)
                        .map(enrollmentViewMapper::toReadCompletedLessonsView)
                        .orElseThrow(() -> new EnrollmentNotFoundException(
                                "Enrollment not found for userId=" + userId + " and courseId=" + courseId))
        );
    }
}
