package com.example.course_service.application.interactors.mappers;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdView;
import com.example.course_service.domain.lesson.Lesson;

public class LessonViewMapper {

    public ReadLessonByIdView toReadLessonByIdView(Lesson lesson) {
        return new ReadLessonByIdView(
                lesson.getCourseId(),
                lesson.getType().getLessonType(),
                lesson.getTitle().getTitle(),
                lesson.getContent(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }
}
