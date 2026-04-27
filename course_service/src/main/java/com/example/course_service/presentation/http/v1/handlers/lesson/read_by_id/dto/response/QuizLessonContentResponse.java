package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Quiz lesson content")
public record QuizLessonContentResponse(
        @Schema(description = "Introductory markdown", example = "## Answer the questions")
        String introMarkdown,
        @Schema(description = "Quiz questions")
        List<QuizQuestionResponse> questions
) implements LessonContentResponse {
}
