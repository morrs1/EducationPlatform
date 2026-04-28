package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Lesson details with typed content and assets")
public record ReadLessonByIdResponse(
        @Schema(description = "Parent course identifier", example = "2f5e6597-dbcd-4e8e-b3f7-2b3715628dca")
        UUID courseId,
        @Schema(description = "Lesson type", example = "theory")
        String type,
        @Schema(description = "Lesson title", example = "Variables")
        String title,
        @Schema(description = "Typed lesson content")
        LessonContentResponse content,
        @Schema(description = "Attached assets")
        List<AssetResponse> assets,
        @Schema(description = "Creation timestamp")
        LocalDateTime createdAt,
        @Schema(description = "Last update timestamp")
        LocalDateTime updatedAt
) {
}
