package org.example.learning_service.domain.enrollment.services;

import org.example.learning_service.domain.base.BaseDomainService;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.Objects;

public class EnrollmentDomainService extends BaseDomainService {

    /** Перевести активное зачисление в завершённое. */
    public void markCourseCompleted(Enrollment enrollment, LocalDateTime completedAt) throws ValidateException {
        Objects.requireNonNull(enrollment);
        Objects.requireNonNull(completedAt);
        if (EnrollmentStatus.COMPLETED.equals(enrollment.getStatus().getValue())) {
            throw new ValidateException("Enrollment is already completed");
        }
        enrollment.setStatus(new EnrollmentStatus(EnrollmentStatus.COMPLETED));
        enrollment.setCompletedAt(completedAt);
        enrollment.setUpdatedAt(completedAt);
    }
}
