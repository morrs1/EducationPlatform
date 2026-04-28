package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Lesson asset metadata")
public record AssetResponse(
        @Schema(description = "Asset identifier", example = "6d4270a7-1cd3-4111-aab8-6ebc2efc7b33")
        UUID id,
        @Schema(description = "Parent course identifier", example = "2f5e6597-dbcd-4e8e-b3f7-2b3715628dca")
        UUID courseId,
        @Schema(description = "Parent lesson identifier", example = "fce5d5d5-5156-4a86-b2ab-c49c6ab98bb1")
        UUID lessonId,
        @Schema(description = "Asset type", example = "image")
        String type,
        @Schema(description = "Storage key", example = "lessons_assets/2c28d35e-image.png")
        String storageKey,
        @Schema(description = "Public URL", example = "https://cdn.example.local/lessons_assets/2c28d35e-image.png")
        String publicUrl,
        @Schema(description = "MIME type", example = "image/png")
        String mimeType,
        @Schema(description = "File size in bytes", example = "23456")
        Long sizeBytes,
        @Schema(description = "Original filename", example = "diagram.png")
        String originalFilename,
        @Schema(description = "Human-readable title", example = "Variables diagram")
        String title,
        @Schema(description = "Creation timestamp")
        LocalDateTime createdAt
) {
}
