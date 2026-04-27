package com.example.course_service.domain.lesson.services;

import com.example.course_service.domain.base.BaseDomainService;
import com.example.course_service.domain.lesson.Lesson;
import com.example.course_service.domain.lesson.payload.LessonPayload;
import com.example.course_service.domain.lesson.vo.LessonTitle;
import com.example.course_service.domain.lesson.vo.LessonType;

import java.time.LocalDateTime;
import java.util.UUID;

public class LessonDomainService extends BaseDomainService {

    public Lesson create(
            UUID courseId,
            String type,
            String title
    ) {
        return new Lesson(
                UUID.randomUUID(),
                courseId,
                new LessonType(type),
                new LessonTitle(title),
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    public void uploadContent(Lesson lesson, LessonPayload content) {
        lesson.setContent(content);
    }
}
