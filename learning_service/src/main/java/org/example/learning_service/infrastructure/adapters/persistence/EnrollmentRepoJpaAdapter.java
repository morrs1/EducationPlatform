package org.example.learning_service.infrastructure.adapters.persistence;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;
import org.example.learning_service.infrastructure.persistence.mappers.EnrollmentPersistenceMapper;
import org.example.learning_service.infrastructure.persistence.repositories.EnrollmentSpringDataRepo;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EnrollmentRepoJpaAdapter implements EnrollmentRepo {

    private final EnrollmentSpringDataRepo enrollmentSpringDataRepo;
    private final EnrollmentPersistenceMapper enrollmentPersistenceMapper;

    @Override
    public Optional<Enrollment> findFetchedByUserIdAndCourseId(UUID userId, UUID courseId) {
        return enrollmentSpringDataRepo.findFetchedByUserIdAndCourseId(userId, courseId)
                .map(enrollmentPersistenceMapper::toDomain);
    }

    @Override
    public Optional<Enrollment> findSummaryById(UUID id) {
        return enrollmentSpringDataRepo.findById(id)
                .map(enrollmentPersistenceMapper::toDomainWithoutCompletions);
    }

    @Override
    public boolean existsByUserIdAndCourseId(UUID userId, UUID courseId) {
        return enrollmentSpringDataRepo.existsByUserIdAndCourseId(userId, courseId);
    }

    @Override
    public void save(Enrollment enrollment) {
        var existing = enrollmentSpringDataRepo.findById(enrollment.getId());
        if (existing.isPresent()) {
            enrollmentPersistenceMapper.applyDomainToManaged(existing.get(), enrollment);
            enrollmentSpringDataRepo.save(existing.get());
        } else {
            enrollmentSpringDataRepo.save(enrollmentPersistenceMapper.toEntityForInsert(enrollment));
        }
    }

    @Override
    public List<Enrollment> findSummariesByUserIdForCompletedCourses(UUID userId) {
        return enrollmentSpringDataRepo.findAllByUserIdAndStatusOrdered(userId, EnrollmentStatus.COMPLETED)
                .stream()
                .map(enrollmentPersistenceMapper::toDomainWithoutCompletions)
                .toList();
    }

    @Override
    public List<Enrollment> findSummariesByUserIdForIncompleteCourses(UUID userId) {
        return enrollmentSpringDataRepo.findAllByUserIdAndStatusOrdered(userId, EnrollmentStatus.IN_PROGRESS)
                .stream()
                .map(enrollmentPersistenceMapper::toDomainWithoutCompletions)
                .toList();
    }

    @Override
    public void deleteById(UUID enrollmentId) {
        enrollmentSpringDataRepo.deleteById(enrollmentId);
    }
}
