package org.example.learning_service.infrastructure.persistence.mappers;

import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.LessonCompletion;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;
import org.example.learning_service.infrastructure.persistence.models.enrollment.HibernateEnrollment;
import org.example.learning_service.infrastructure.persistence.models.enrollment.HibernateLessonCompletion;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class EnrollmentPersistenceMapper {

    /**
     * Без загрузки lesson_completion (списки курсов пользователя).
     */
    public Enrollment toDomainWithoutCompletions(HibernateEnrollment entity) {
        return new Enrollment(
                entity.getId(),
                entity.getUserId(),
                entity.getCourseId(),
                new EnrollmentStatus(entity.getStatus()),
                entity.getStartedAt(),
                entity.getCompletedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                Collections.emptyList()
        );
    }

    public Enrollment toDomain(HibernateEnrollment entity) {
        List<LessonCompletion> completions = new ArrayList<>();
        if (entity.getLessonCompletions() != null) {
            for (HibernateLessonCompletion row : entity.getLessonCompletions()) {
                completions.add(new LessonCompletion(row.getId(), row.getLessonId(), row.getCompletedAt()));
            }
        }
        return new Enrollment(
                entity.getId(),
                entity.getUserId(),
                entity.getCourseId(),
                new EnrollmentStatus(entity.getStatus()),
                entity.getStartedAt(),
                entity.getCompletedAt(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                completions
        );
    }

    /** Новая строка enrollment (ещё без lesson_completion). */
    public HibernateEnrollment toEntityForInsert(Enrollment enrollment) {
        HibernateEnrollment entity = new HibernateEnrollment();
        entity.setId(enrollment.getId());
        entity.setUserId(enrollment.getUserId());
        entity.setCourseId(enrollment.getCourseId());
        entity.setStatus(enrollment.getStatus().getValue());
        entity.setStartedAt(enrollment.getStartedAt());
        entity.setCompletedAt(enrollment.getCompletedAt());
        entity.setCreatedAt(enrollment.getCreatedAt());
        entity.setUpdatedAt(enrollment.getUpdatedAt());
        entity.setLessonCompletions(new ArrayList<>());
        return entity;
    }

    /** Обновляет управляемую сущность из домена, синхронизируя строки завершений уроков. */
    public void applyDomainToManaged(HibernateEnrollment managed, Enrollment domain) {
        managed.setStatus(domain.getStatus().getValue());
        managed.setStartedAt(domain.getStartedAt());
        managed.setCompletedAt(domain.getCompletedAt());
        managed.setUpdatedAt(domain.getUpdatedAt());
        managed.getLessonCompletions().clear();
        for (LessonCompletion lc : domain.getLessonCompletions()) {
            HibernateLessonCompletion row = new HibernateLessonCompletion();
            row.setId(lc.getId());
            row.setLessonId(lc.getLessonId());
            row.setCompletedAt(lc.getCompletedAt());
            row.setEnrollment(managed);
            managed.getLessonCompletions().add(row);
        }
    }
}
