package com.example.course_service.application.ports;

import com.example.course_service.domain.course.Course;

import java.util.Optional;
import java.util.UUID;

public interface CourseRepo {
    Optional<Course> readById(UUID id);
}
