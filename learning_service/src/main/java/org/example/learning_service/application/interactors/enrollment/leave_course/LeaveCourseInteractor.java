package org.example.learning_service.application.interactors.enrollment.leave_course;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.activity.services.StudyActivityDomainService;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.LessonCompletion;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RequiredArgsConstructor
public class LeaveCourseInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final CertificateRepo certificateRepo;
    private final StudyActivityRepo studyActivityRepo;
    private final StudyActivityDomainService studyActivityDomainService;

    public void execute(LeaveCourseCommand command) {
        Objects.requireNonNull(command);
        transactionManager.inTransaction(() -> {
            Enrollment enrollment = enrollmentRepo
                    .findFetchedByUserIdAndCourseId(command.userId(), command.courseId())
                    .orElseThrow(() -> new EnrollmentNotFoundException(
                            "Enrollment not found for userId=" + command.userId()
                                    + ", courseId=" + command.courseId()));
            UUID enrollmentId = enrollment.getId();
            UUID userId = enrollment.getUserId();

            reverseStudyActivityForCompletions(enrollment.getLessonCompletions(), userId);

            if (certificateRepo.existsByEnrollmentId(enrollmentId)) {
                certificateRepo.deleteByEnrollmentId(enrollmentId);
            }

            enrollmentRepo.deleteById(enrollmentId);
        });
    }

    private void reverseStudyActivityForCompletions(List<LessonCompletion> completions, UUID userId) {
        if (Objects.isNull(completions) || completions.isEmpty()) {
            return;
        }
        Map<LocalDate, Integer> removalsByDay = new HashMap<>();
        for (LessonCompletion lc : completions) {
            if (lc.getCompletedAt() == null) {
                continue;
            }
            LocalDate day = lc.getCompletedAt().toLocalDate();
            removalsByDay.merge(day, 1, Integer::sum);
        }
        for (Map.Entry<LocalDate, Integer> e : removalsByDay.entrySet()) {
            studyActivityRepo.findByUserIdAndActivityDate(userId, e.getKey()).ifPresent(day -> {
                studyActivityDomainService.removeRecordedLessons(day, e.getValue());
                if (day.getLessonsCompletedCount() == 0) {
                    studyActivityRepo.deleteByUserIdAndActivityDate(userId, e.getKey());
                } else {
                    studyActivityRepo.save(day);
                }
            });
        }
    }
}
