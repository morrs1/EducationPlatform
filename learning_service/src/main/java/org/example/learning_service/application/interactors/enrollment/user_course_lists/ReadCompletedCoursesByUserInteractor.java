package org.example.learning_service.application.interactors.enrollment.user_course_lists;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.mappers.EnrollmentViewMapper;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadCompletedCoursesByUserInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final EnrollmentViewMapper enrollmentViewMapper;

    public UserCoursesListView read(UUID userId) {
        return transactionManager.inTransaction(() ->
                enrollmentViewMapper.toUserCoursesListView(
                        userId,
                        enrollmentRepo.findSummariesByUserIdForCompletedCourses(userId)
                )
        );
    }
}
