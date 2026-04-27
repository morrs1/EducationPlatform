package com.example.course_service.application.ports;

import com.example.course_service.domain.lesson.Lesson;

import java.util.Optional;
import java.util.UUID;

public interface LessonRepo {

    Optional<Lesson> readById(UUID id);

    UUID add(Lesson lesson);

    void uploadContent(Lesson lesson);
}
