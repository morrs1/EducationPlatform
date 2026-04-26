package com.example.course_service.application.interactors.lesson.add_lesson;

import java.util.UUID;

public record AddLessonCommand(
        UUID courseId,
        UUID moduleId,
        String type,
        String title,
        Integer position,
        Integer estimatedMinutes,
        Boolean isPreview
) {
}
