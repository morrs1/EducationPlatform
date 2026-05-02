package org.example.learning_service.application.ports;

import org.example.learning_service.domain.enrollment.Enrollment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepo {

    Optional<Enrollment> findFetchedByUserIdAndCourseId(UUID userId, UUID courseId);

    /** Зачисление без lesson_completion (для проверок по id). */
    Optional<Enrollment> findSummaryById(UUID id);

    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    void save(Enrollment enrollment);

    /** Зачисления со статусом {@code completed}, без строк lesson_completion. */
    List<Enrollment> findSummariesByUserIdForCompletedCourses(UUID userId);

    /** Зачисления в процессе ({@code in_progress}), без lesson_completion. */
    List<Enrollment> findSummariesByUserIdForIncompleteCourses(UUID userId);
}
