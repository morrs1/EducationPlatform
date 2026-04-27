package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Starter code template for a programming language")
public record CodingLanguageTemplateResponse(
        @Schema(description = "Programming language", example = "java")
        String language,
        @Schema(description = "Starter code", example = "class Main { public static void main(String[] args) {} }")
        String starterCode
) {
}
