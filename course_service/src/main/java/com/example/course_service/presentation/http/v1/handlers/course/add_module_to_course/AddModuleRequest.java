package com.example.course_service.presentation.http.v1.handlers.course.add_module_to_course;

public record AddModuleRequest(
        String title,
        String description,
        Integer position,
        Integer estimatedMinutes
) {
}
