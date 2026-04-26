package com.example.course_service.application.interactors.course.add_module_to_course;

import java.util.UUID;

public record AddModuleCommand(
        UUID courseId,
        String title,
        String description,
        Integer position,
        Integer estimatedMinutes
) {
}
