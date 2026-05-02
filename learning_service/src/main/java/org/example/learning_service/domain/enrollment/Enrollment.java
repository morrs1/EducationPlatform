package org.example.learning_service.domain.enrollment;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.learning_service.domain.base.BaseEntity;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Enrollment extends BaseEntity {

    private UUID userId;
    private UUID courseId;
    private EnrollmentStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LessonCompletion> lessonCompletions;

    public Enrollment(
            UUID id,
            UUID userId,
            UUID courseId,
            EnrollmentStatus status,
            LocalDateTime startedAt,
            LocalDateTime completedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<LessonCompletion> lessonCompletions
    ) {
        super(id);
        this.userId = Objects.requireNonNull(userId);
        this.courseId = Objects.requireNonNull(courseId);
        this.status = Objects.requireNonNull(status);
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = Objects.requireNonNull(updatedAt);
        this.lessonCompletions =
                Objects.isNull(lessonCompletions) ? new ArrayList<>() : new ArrayList<>(lessonCompletions);
    }

    public void addLessonCompletion(LessonCompletion completion) throws ValidateException {
        Objects.requireNonNull(completion, "completion must not be null");
        UUID lessonId = Objects.requireNonNull(completion.getLessonId(), "lessonId must not be null");
        for (LessonCompletion existing : lessonCompletions) {
            if (lessonId.equals(existing.getLessonId())) {
                throw new ValidateException("Lesson already completed for this enrollment: " + lessonId);
            }
        }
        lessonCompletions.add(completion);
    }
}
