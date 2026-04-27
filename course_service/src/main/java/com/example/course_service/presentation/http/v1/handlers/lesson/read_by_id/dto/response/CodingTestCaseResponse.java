package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Coding lesson test case")
public record CodingTestCaseResponse(
        @Schema(description = "Test case identifier", example = "44444444-4444-4444-4444-444444444444")
        UUID id,
        @Schema(description = "Whether the test case is visible to the learner", example = "true")
        Boolean isPublic,
        @Schema(description = "Test input", example = "1 2")
        String input,
        @Schema(description = "Expected output", example = "3")
        String expectedOutput
) {
}
