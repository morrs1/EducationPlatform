package com.example.course_service.presentation.http.v1.handlers.course.add_course;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Reference to an existing tag")
public record CourseTagRef(
        @Schema(description = "Tag identifier", example = "c44c2357-0620-49bb-90ee-137fb6a49208")
        UUID id
) {
}
