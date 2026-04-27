package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Flattened course module")
public record ModuleResponse(
        @Schema(description = "Module identifier", example = "ca3f2123-ef85-4f8a-9ef4-f45a277fa711")
        UUID id,
        @Schema(description = "Parent course identifier", example = "2f5e6597-dbcd-4e8e-b3f7-2b3715628dca")
        UUID courseId,
        @Schema(description = "Module title", example = "Introduction")
        String title,
        @Schema(description = "Module description", example = "Overview of the first module")
        String description,
        @Schema(description = "Module position", example = "1")
        Integer position,
        @Schema(description = "Estimated duration in minutes", example = "45")
        Integer estimatedMinutes,
        @Schema(description = "Lesson previews inside the module")
        List<LessonPreviewResponse> lessons
) {
}
