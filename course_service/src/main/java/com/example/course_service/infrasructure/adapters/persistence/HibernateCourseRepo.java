package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.domain.course.Course;
import com.example.course_service.infrasructure.persistence.mappers.CourseHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.HibernateCourse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateCourseRepo implements CourseRepo {

    private final EntityManager entityManager;
    private final CourseHibernateMapper mapper;


    @Override
    public Optional<Course> readById(UUID id) {
        return entityManager.createQuery(
                        "select c from HibernateCourse c where c.id = :id",
                        HibernateCourse.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .map(mapper::toDomainCourse);
    }
}
