package org.example.learning_service.application.interactors.enrollment.complete_course;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.services.EnrollmentDomainService;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class CompleteCourseInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final EnrollmentDomainService enrollmentDomainService;

    public CompleteCourseView execute(CompleteCourseCommand command) {
        return transactionManager.inTransaction(() -> {
            Enrollment enrollment = enrollmentRepo
                    .findFetchedByUserIdAndCourseId(command.userId(), command.courseId())
                    .orElseThrow(() -> new EnrollmentNotFoundException(
                            "Enrollment not found for userId=" + command.userId()
                                    + " and courseId=" + command.courseId()));
            LocalDateTime completedAt = command.completedAt() != null
                    ? command.completedAt()
                    : LocalDateTime.now();
            enrollmentDomainService.markCourseCompleted(enrollment, completedAt);
            enrollmentRepo.save(enrollment);
            return new CompleteCourseView(
                    enrollment.getId(),
                    enrollment.getUserId(),
                    enrollment.getCourseId(),
                    enrollment.getStatus().getValue(),
                    enrollment.getCompletedAt()
            );
        });
    }
}
