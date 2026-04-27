package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Quiz question")
public record QuizQuestionResponse(
        @Schema(description = "Question identifier", example = "11111111-1111-1111-1111-111111111111")
        UUID id,
        @Schema(description = "Question type", example = "single_choice")
        String type,
        @Schema(description = "Question text", example = "What is Java?")
        String text,
        @Schema(description = "Answer options")
        List<QuizOptionResponse> options
) {
}
