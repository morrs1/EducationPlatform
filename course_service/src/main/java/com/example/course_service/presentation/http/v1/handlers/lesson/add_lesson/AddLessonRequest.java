package com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson;

import java.util.UUID;

public record AddLessonRequest(
        UUID courseId,
        UUID moduleId,
        String type,
        String title,
        Integer position,
        Integer estimatedMinutes,
        Boolean isPreview
) {
}
