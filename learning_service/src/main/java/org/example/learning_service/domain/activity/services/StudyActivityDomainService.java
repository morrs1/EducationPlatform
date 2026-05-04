package org.example.learning_service.domain.activity.services;

import org.example.learning_service.domain.base.BaseDomainService;
import org.example.learning_service.domain.activity.UserStudyDay;

import java.util.Objects;

public class StudyActivityDomainService extends BaseDomainService {

    public void recordLessonCompleted(UserStudyDay day, int delta) {
        Objects.requireNonNull(day);
        day.incrementLessonsCompleted(delta);
    }

    /** Mirrors {@link #recordLessonCompleted}: subtracts completed-lesson counts when leave-course removes completions. */
    public void removeRecordedLessons(UserStudyDay day, int delta) {
        Objects.requireNonNull(day);
        day.decrementLessonsCompleted(delta);
    }
}
