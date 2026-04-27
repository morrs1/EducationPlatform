package com.example.course_service.presentation.http.v1.handlers.lesson.upload_content;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record UploadLessonContentRequest(
        @Schema(
                description = "Lesson content body. Its structure must match the target lesson type: theory, quiz, or coding.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Map<String, Object> content
) {
}
