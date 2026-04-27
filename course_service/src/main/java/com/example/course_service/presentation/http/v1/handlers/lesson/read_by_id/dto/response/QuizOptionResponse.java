package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Quiz answer option")
public record QuizOptionResponse(
        @Schema(description = "Option identifier", example = "22222222-2222-2222-2222-222222222222")
        UUID id,
        @Schema(description = "Option text", example = "Programming language")
        String text,
        @Schema(description = "Whether this option is correct", example = "true")
        Boolean isCorrect
) {
}
