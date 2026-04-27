package com.example.course_service.presentation.http.v1.handlers.course.add_module_to_course;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload for adding a module to a course")
public record AddModuleRequest(
        @Schema(description = "Module title", example = "Introduction")
        String title,
        @Schema(description = "Module description", example = "Overview of the first module")
        String description,
        @Schema(description = "Module position inside the course", example = "1")
        Integer position,
        @Schema(description = "Estimated duration in minutes", example = "45")
        Integer estimatedMinutes
) {
}
