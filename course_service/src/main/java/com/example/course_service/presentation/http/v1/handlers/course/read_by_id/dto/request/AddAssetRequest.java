package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Metadata for uploaded lesson asset")
public record AddAssetRequest(
        @Schema(description = "Human-readable asset title", example = "Variables diagram")
        String title,
        @Schema(description = "Asset type", allowableValues = {"image", "video", "file", "cover"}, example = "image")
        String assetType
) {
}
