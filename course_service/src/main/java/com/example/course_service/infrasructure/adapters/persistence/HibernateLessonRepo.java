package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.domain.lesson.Lesson;
import com.example.course_service.infrasructure.persistence.mappers.LessonHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.lesson.HibernateLesson;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateLessonRepo implements LessonRepo {

    private final EntityManager entityManager;
    private final LessonHibernateMapper mapper;

    @Override
    public Optional<Lesson> readById(UUID id) {
        return entityManager.createQuery(
                        "select l from HibernateLesson l where l.id = :id",
                        HibernateLesson.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .map(mapper::toDomainLesson);
    }

    @Override
    public UUID add(Lesson lesson) {
        var hibernateLesson = mapper.toHibernateLesson(lesson);
        entityManager.persist(hibernateLesson);
        return hibernateLesson.getId();
    }
}
