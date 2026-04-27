package com.example.course_service.presentation.http.v1.handlers.course.add_course;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Payload for creating a new course")
public record AddCourseRequest(
        @Schema(description = "Author identifier", example = "34fd4f75-6e31-4fa6-96c8-b9ecf85d6b5a")
        UUID authorId,
        @Schema(description = "Course title", example = "Java Core for Beginners")
        String courseTitle,
        @Schema(description = "Short course description", example = "A compact introduction to Java fundamentals")
        String shortDescription,
        @Schema(description = "Full course description", example = "This course covers syntax, OOP basics, collections, and exceptions.")
        String description,
        @Schema(description = "Course difficulty", example = "beginner")
        String courseDifficulty,
        @Schema(description = "Course language code", example = "en")
        String languageCode,
        @Schema(description = "Estimated duration in minutes", example = "240")
        Integer estimatedMinutes,
        @Schema(description = "Associated course tags")
        List<CourseTagRef> tags
) {
}
