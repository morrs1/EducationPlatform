package org.example.learning_service.infrastructure.persistence.mappers;

import org.example.learning_service.domain.activity.UserStudyDay;
import org.example.learning_service.infrastructure.persistence.models.activity.HibernateUserStudyDay;
import org.example.learning_service.infrastructure.persistence.models.activity.HibernateUserStudyDayId;
import org.springframework.stereotype.Component;

@Component
public class StudyActivityPersistenceMapper {

    public UserStudyDay toDomain(HibernateUserStudyDay entity) {
        return new UserStudyDay(
                entity.getId().getUserId(),
                entity.getId().getActivityDate(),
                entity.getLessonsCompletedCount()
        );
    }

    public HibernateUserStudyDay toEntity(UserStudyDay domain) {
        HibernateUserStudyDayId id = new HibernateUserStudyDayId(domain.getUserId(), domain.getActivityDate());
        HibernateUserStudyDay entity = new HibernateUserStudyDay();
        entity.setId(id);
        entity.setLessonsCompletedCount(domain.getLessonsCompletedCount());
        return entity;
    }
}
