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

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
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

    @Override
    public List<Course> readAll() {
        return entityManager
                .createQuery(
                        "select distinct c from HibernateCourse c left join fetch c.tags where c.isPreview =:isPreview order by c.createdAt desc",
                        HibernateCourse.class
                )
                .setParameter("isPreview", true)
                .getResultList()
                .stream().map(mapper::toDomainCourse)
                .toList();
    }

    @Override
    public List<Course> readPublishedCoursesByAuthor(UUID authorId) {
        return entityManager
                .createQuery(
                        "select distinct c from HibernateCourse c left join fetch c.tags "
                                + "where c.authorId = :authorId and c.isPreview = true order by c.createdAt desc",
                        HibernateCourse.class
                )
                .setParameter("authorId", authorId)
                .getResultList()
                .stream()
                .map(mapper::toDomainCourse)
                .toList();
    }

    @Override
    public List<Course> readDraftCoursesByAuthor(UUID authorId) {
        return entityManager
                .createQuery(
                        "select distinct c from HibernateCourse c left join fetch c.tags "
                                + "where c.authorId = :authorId and (c.isPreview is null or c.isPreview = false) "
                                + "order by c.createdAt desc",
                        HibernateCourse.class
                )
                .setParameter("authorId", authorId)
                .getResultList()
                .stream()
                .map(mapper::toDomainCourse)
                .toList();
    }


    @Override
    public List<Course> readByString(String request) {
        String q = Objects.requireNonNullElse(request, "").trim();
        if (q.isEmpty()) {
            return List.of();
        }

        List<?> idRows = entityManager
                .createNativeQuery(
                        """
                                SELECT c.id
                                FROM course c
                                WHERE c.fts_vector @@ plainto_tsquery('simple', :q)
                                  AND c.is_preview = true
                                ORDER BY ts_rank(c.fts_vector, plainto_tsquery('simple', :q)) DESC
                                """
                )
                .setParameter("q", q)
                .getResultList();
        if (idRows.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = idRows.stream().map(HibernateCourseRepo::toUuid).toList();
        List<HibernateCourse> fetched = entityManager
                .createQuery(
                        "select distinct c from HibernateCourse c left join fetch c.tags where c.id in :ids",
                        HibernateCourse.class
                )
                .setParameter("ids", ids)
                .getResultList();

        var byId = fetched.stream()
                .collect(Collectors.toMap(HibernateCourse::getId, Function.identity()));

        return ids.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(mapper::toDomainCourse)
                .toList();
    }

    private static UUID toUuid(Object row) {
        if (row instanceof UUID uuid) {
            return uuid;
        }
        return UUID.fromString(row.toString());
    }

    @Override
    public void publishCourse(UUID courseId) {
        var hibernateCourse = entityManager.find(HibernateCourse.class, courseId);
        if (hibernateCourse == null) {
            throw new CourseNotFoundException("Course with this id was not found");
        }
        hibernateCourse.setIsPreview(true);
        hibernateCourse.setUpdatedAt(LocalDateTime.now());
    }
}
