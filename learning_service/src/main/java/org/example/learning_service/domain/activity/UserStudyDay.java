package org.example.learning_service.domain.activity;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.learning_service.domain.base.exceptions.ValidateException;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode
public class UserStudyDay {

    private UUID userId;
    private LocalDate activityDate;
    private int lessonsCompletedCount;

    public UserStudyDay(UUID userId, LocalDate activityDate, int lessonsCompletedCount) {
        this.userId = Objects.requireNonNull(userId);
        this.activityDate = Objects.requireNonNull(activityDate);
        if (lessonsCompletedCount < 0) {
            throw new ValidateException("lessonsCompletedCount must not be negative");
        }
        this.lessonsCompletedCount = lessonsCompletedCount;
    }

    public void incrementLessonsCompleted(int delta) throws ValidateException {
        if (delta <= 0) {
            throw new ValidateException("delta must be positive");
        }
        this.lessonsCompletedCount = this.lessonsCompletedCount + delta;
    }
}
