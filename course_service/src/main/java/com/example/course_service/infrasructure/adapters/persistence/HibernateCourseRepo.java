package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.exceptions.CourseNotFoundException;
import com.example.course_service.application.exceptions.ModuleNotFoundException;
import com.example.course_service.application.exceptions.TagNotFoundException;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.module.Module;
import com.example.course_service.infrasructure.persistence.mappers.CourseHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.course.HibernateCourse;
import com.example.course_service.infrasructure.persistence.models.course.HibernateTag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
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

    @Override
    public UUID addModule(Module module) {
        var hibernateCourse = entityManager.find(HibernateCourse.class, module.getCourseId());
        if (hibernateCourse == null) {
            throw new CourseNotFoundException("Course with this id was not found");
        }

        var course = mapper.toDomainCourse(hibernateCourse);
        if (course.getStructure() == null) {
            course.setStructure(new ArrayList<>());
        }
        course.getStructure().add(module);
        entityManager.merge(mapper.toHibernateCourse(course));
        return module.getId();
    }

    @Override
    public void addLessonPreview(UUID courseId, UUID moduleId, LessonPreview lessonPreview) {
        var hibernateCourse = entityManager.find(HibernateCourse.class, courseId);
        if (hibernateCourse == null) {
            throw new CourseNotFoundException("Course with this id was not found");
        }

        var course = mapper.toDomainCourse(hibernateCourse);
        if (course.getStructure() == null) {
            course.setStructure(new ArrayList<>());
        }

        var module = course.getStructure().stream()
                .filter(existingModule -> existingModule.getId().equals(moduleId))
                .findFirst()
                .orElseThrow(() -> new ModuleNotFoundException("Module with this id was not found"));

        if (module.getLessons() == null) {
            module.setLessons(new ArrayList<>());
        }
        module.getLessons().add(lessonPreview);
        entityManager.merge(mapper.toHibernateCourse(course));
    }
}
