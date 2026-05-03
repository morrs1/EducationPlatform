package org.example.learning_service.application.interactors.enrollment.complete_lesson;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.activity.UserStudyDay;
import org.example.learning_service.domain.activity.services.StudyActivityDomainService;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.LessonCompletion;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@RequiredArgsConstructor
public class CompleteLessonInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final StudyActivityRepo studyActivityRepo;
    private final StudyActivityDomainService studyActivityDomainService;

    public CompleteLessonView execute(CompleteLessonCommand command) {
        Objects.requireNonNull(command);
        return transactionManager.inTransaction(() -> {
            Enrollment enrollment = enrollmentRepo
                    .findFetchedByUserIdAndCourseId(command.userId(), command.courseId())
                    .orElseThrow(() -> new EnrollmentNotFoundException(
                            "Enrollment not found for userId=" + command.userId()
                                    + ", courseId=" + command.courseId()));
            requireInProgress(enrollment);

            LocalDateTime completedAt = command.completedAt() != null ? command.completedAt() : LocalDateTime.now();

            LessonCompletion lessonCompletion =
                    new LessonCompletion(UUID.randomUUID(), command.lessonId(), completedAt);
            enrollment.addLessonCompletion(lessonCompletion);
            enrollment.setUpdatedAt(completedAt);
            enrollmentRepo.save(enrollment);

            var activityDate = completedAt.toLocalDate();
            incrementActivityForDay(enrollment.getUserId(), activityDate);

            return new CompleteLessonView(
                    enrollment.getId(),
                    enrollment.getUserId(),
                    enrollment.getCourseId(),
                    command.lessonId(),
                    lessonCompletion.getCompletedAt(),
                    activityDate
            );
        });
    }

    private static void requireInProgress(Enrollment enrollment) throws ValidateException {
        if (!EnrollmentStatus.IN_PROGRESS.equals(enrollment.getStatus().getValue())) {
            throw new ValidateException(
                    "Can only complete lessons while enrollment is in_progress; current status="
                            + enrollment.getStatus().getValue());
        }
    }

    /** Та же транзакция что и сохранение урока. */
    private void incrementActivityForDay(UUID userId, LocalDate activityDate) {
        UserStudyDay day = studyActivityRepo.findByUserIdAndActivityDate(userId, activityDate)
                .orElseGet(() -> new UserStudyDay(userId, activityDate, 0));
        studyActivityDomainService.recordLessonCompleted(day, 1);
        studyActivityRepo.save(day);
    }
}
