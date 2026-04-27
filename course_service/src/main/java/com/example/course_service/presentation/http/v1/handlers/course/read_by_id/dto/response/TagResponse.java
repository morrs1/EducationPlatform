package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Course tag")
public record TagResponse(
        @Schema(description = "Tag identifier", example = "c44c2357-0620-49bb-90ee-137fb6a49208")
        UUID id,
        @Schema(description = "Tag name", example = "backend")
        String name
) {
}
