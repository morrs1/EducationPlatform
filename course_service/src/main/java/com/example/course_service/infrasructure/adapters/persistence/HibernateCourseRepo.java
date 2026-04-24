package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.exceptions.TagNotFoundException;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.domain.course.Course;
import com.example.course_service.infrasructure.persistence.mappers.CourseHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.course.HibernateCourse;
import com.example.course_service.infrasructure.persistence.models.course.HibernateTag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class HibernateCourseRepo implements CourseRepo {

    private final EntityManager entityManager;
    private final CourseHibernateMapper mapper;


    @Override
    public Optional<Course> readById(UUID id) {
        return entityManager.createQuery(
                        "select distinct c from HibernateCourse c left join fetch c.tags where c.id = :id",
                        HibernateCourse.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .map(mapper::toDomainCourse);
    }

    @Override
    public UUID add(Course course) {
        var hibernateCourse = mapper.toHibernateCourse(course);
        Set<HibernateTag> managedTags;
        try {
            managedTags = hibernateCourse.getTags().stream()
                    .map(tag -> entityManager.getReference(HibernateTag.class, tag.getId()))
                    .collect(Collectors.toSet());
        } catch (EntityNotFoundException ex) {
            throw new TagNotFoundException("Tag with this id was not found");
        }
        hibernateCourse.setTags(managedTags);
        entityManager.persist(hibernateCourse);
        return hibernateCourse.getId();
    }
}
