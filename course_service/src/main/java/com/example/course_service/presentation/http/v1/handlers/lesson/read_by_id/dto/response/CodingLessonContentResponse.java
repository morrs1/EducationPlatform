package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Coding lesson content")
public record CodingLessonContentResponse(
        @Schema(description = "Task markdown", example = "## Implement sum")
        String taskMarkdown,
        @Schema(description = "Checker type", example = "stdin_stdout")
        String checkerType,
        @Schema(description = "Starter code templates per language")
        List<CodingLanguageTemplateResponse> languages,
        @Schema(description = "Coding test cases")
        List<CodingTestCaseResponse> testCases
) implements LessonContentResponse {
}
