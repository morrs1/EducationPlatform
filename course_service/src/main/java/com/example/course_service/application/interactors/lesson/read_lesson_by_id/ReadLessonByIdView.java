package com.example.course_service.application.interactors.lesson.read_lesson_by_id;

import com.example.course_service.domain.lesson.payload.LessonPayload;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReadLessonByIdView(
        UUID courseId,
        String type,
        String title,
        LessonPayload content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
