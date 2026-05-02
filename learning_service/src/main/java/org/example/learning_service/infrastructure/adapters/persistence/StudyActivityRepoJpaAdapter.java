package org.example.learning_service.infrastructure.adapters.persistence;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.domain.activity.UserStudyDay;
import org.example.learning_service.infrastructure.persistence.mappers.StudyActivityPersistenceMapper;
import org.example.learning_service.infrastructure.persistence.repositories.StudyActivitySpringDataRepo;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StudyActivityRepoJpaAdapter implements StudyActivityRepo {

    private final StudyActivitySpringDataRepo studyActivitySpringDataRepo;
    private final StudyActivityPersistenceMapper studyActivityPersistenceMapper;

    @Override
    public Optional<UserStudyDay> findByUserIdAndActivityDate(UUID userId, LocalDate activityDate) {
        return studyActivitySpringDataRepo.findOneByUserAndDate(userId, activityDate)
                .map(studyActivityPersistenceMapper::toDomain);
    }

    @Override
    public List<UserStudyDay> findByUserIdAndActivityDateBetween(UUID userId, LocalDate fromInclusive, LocalDate toInclusive) {
        return studyActivitySpringDataRepo.findAllByUserAndDateRange(userId, fromInclusive, toInclusive).stream()
                .map(studyActivityPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public void save(UserStudyDay userStudyDay) {
        studyActivitySpringDataRepo.save(studyActivityPersistenceMapper.toEntity(userStudyDay));
    }
}
