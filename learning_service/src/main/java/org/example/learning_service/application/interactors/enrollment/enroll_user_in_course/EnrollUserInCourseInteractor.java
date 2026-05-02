package org.example.learning_service.application.interactors.enrollment.enroll_user_in_course;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.EnrollmentAlreadyExistsException;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class EnrollUserInCourseInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;

    public EnrollUserInCourseView execute(EnrollUserInCourseCommand command) {
        return transactionManager.inTransaction(() -> {
            if (enrollmentRepo.existsByUserIdAndCourseId(command.userId(), command.courseId())) {
                throw new EnrollmentAlreadyExistsException(
                        "User is already enrolled in this course (userId=" + command.userId()
                                + ", courseId=" + command.courseId() + ")");
            }
            LocalDateTime now = LocalDateTime.now();
            Enrollment enrollment = new Enrollment(
                    UUID.randomUUID(),
                    command.userId(),
                    command.courseId(),
                    new EnrollmentStatus(EnrollmentStatus.IN_PROGRESS),
                    now,
                    null,
                    now,
                    now,
                    List.of()
            );
            enrollmentRepo.save(enrollment);
            return new EnrollUserInCourseView(
                    enrollment.getId(),
                    enrollment.getUserId(),
                    enrollment.getCourseId(),
                    enrollment.getStatus().getValue()
            );
        });
    }
}
