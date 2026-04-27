package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Course details with module structure")
public record ReadCourseByIdResponse(
        @Schema(description = "Author identifier", example = "34fd4f75-6e31-4fa6-96c8-b9ecf85d6b5a")
        UUID authorId,
        @Schema(description = "Course title", example = "Java Core for Beginners")
        String title,
        @Schema(description = "Short description", example = "A compact introduction to Java fundamentals")
        String shortDescription,
        @Schema(description = "Full description", example = "This course covers syntax, OOP basics, collections, and exceptions.")
        String description,
        @Schema(description = "Difficulty level", example = "beginner")
        String difficulty,
        @Schema(description = "Language code", example = "en")
        String languageCode,
        @Schema(description = "Estimated duration in minutes", example = "240")
        Integer estimatedMinutes,
        @Schema(description = "Course module structure")
        List<ModuleResponse> structure,
        @Schema(description = "Creation timestamp")
        LocalDateTime createdAt,
        @Schema(description = "Last update timestamp")
        LocalDateTime updatedAt,
        @Schema(description = "Associated tags")
        List<TagResponse> tags
) {
}
