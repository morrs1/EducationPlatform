package com.example.course_service.application.ports;

import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.module.Module;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseRepo {
    Optional<Course> readById(UUID id);

    UUID add(Course course);

    UUID addModule(Module module);

    void addLessonPreview(UUID courseId, UUID moduleId, LessonPreview lessonPreview);

    List<Course> readAll();

    List<Course> readPublishedCoursesByAuthor(UUID authorId);

    List<Course> readDraftCoursesByAuthor(UUID authorId);

    List<Course> readByString(String request);

    void publishCourse(UUID courseId);
}
