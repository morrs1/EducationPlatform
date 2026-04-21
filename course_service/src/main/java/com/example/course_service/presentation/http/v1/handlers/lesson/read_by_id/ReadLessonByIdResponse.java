package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id;

import com.example.course_service.domain.lesson.payload.LessonPayload;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReadLessonByIdResponse(
        UUID courseId,
        String type,
        String title,
        LessonPayload content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
