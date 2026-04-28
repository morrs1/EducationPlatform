package com.example.course_service.application.ports;

import com.example.course_service.domain.lesson.payload.LessonPayload;

import java.util.Map;

public interface LessonPayloadMapper {

    LessonPayload fromMap(String lessonType, Map<String, Object> content);
}
