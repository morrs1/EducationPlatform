package com.example.course_service.application.interactors.course.read_course_by_id.views;

import java.util.List;
import java.util.UUID;

public record ModuleView(
        UUID id,
        UUID courseId,
        String title,
        String description,
        Integer position,
        Integer estimatedMinutes,
        List<LessonPreviewView> lessons
) {
}
