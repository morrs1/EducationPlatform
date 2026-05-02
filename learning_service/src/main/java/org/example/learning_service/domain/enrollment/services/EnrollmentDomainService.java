package org.example.learning_service.domain.enrollment.services;

import org.example.learning_service.domain.base.BaseDomainService;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.Objects;

public class EnrollmentDomainService extends BaseDomainService {

    public void markDropped(Enrollment enrollment, LocalDateTime droppedAt) throws ValidateException {
        Objects.requireNonNull(enrollment);
        Objects.requireNonNull(droppedAt);
        requireStatusAllowsDrop(enrollment);
        enrollment.setStatus(new EnrollmentStatus(EnrollmentStatus.DROPPED));
        enrollment.setUpdatedAt(droppedAt);
    }

    public void markCourseCompleted(Enrollment enrollment, LocalDateTime completedAt) throws ValidateException {
        Objects.requireNonNull(enrollment);
        Objects.requireNonNull(completedAt);
        cannotCompleteIfDropped(enrollment);
        enrollment.setStatus(new EnrollmentStatus(EnrollmentStatus.COMPLETED));
        enrollment.setCompletedAt(completedAt);
        enrollment.setUpdatedAt(completedAt);
    }

    private void requireStatusAllowsDrop(Enrollment enrollment) throws ValidateException {
        String s = enrollment.getStatus().getValue();
        if (EnrollmentStatus.DROPPED.equals(s)) {
            throw new ValidateException("Enrollment is already dropped");
        }
        if (EnrollmentStatus.COMPLETED.equals(s)) {
            throw new ValidateException("Cannot drop a completed enrollment");
        }
    }

    private void cannotCompleteIfDropped(Enrollment enrollment) throws ValidateException {
        if (EnrollmentStatus.DROPPED.equals(enrollment.getStatus().getValue())) {
            throw new ValidateException("Cannot complete a dropped enrollment");
        }
    }
}
