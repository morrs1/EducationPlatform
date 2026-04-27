package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReadLessonByIdView(
        UUID courseId,
        String type,
        String title,
        LessonContentView content,
        List<AssetView> assets,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
