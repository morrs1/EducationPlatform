package org.example.learning_service.application.ports;

import org.example.learning_service.domain.activity.UserStudyDay;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudyActivityRepo {

    Optional<UserStudyDay> findByUserIdAndActivityDate(UUID userId, LocalDate activityDate);

    List<UserStudyDay> findByUserIdAndActivityDateBetween(UUID userId, LocalDate fromInclusive, LocalDate toInclusive);

    void save(UserStudyDay userStudyDay);

    void deleteByUserIdAndActivityDate(UUID userId, LocalDate activityDate);
}
