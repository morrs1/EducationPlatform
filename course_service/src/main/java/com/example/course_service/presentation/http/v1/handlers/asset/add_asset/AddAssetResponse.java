package com.example.course_service.presentation.http.v1.handlers.asset.add_asset;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Result of successful asset upload")
public record AddAssetResponse(
        @Schema(description = "Storage key of uploaded file", example = "lessons_assets/2c28d35e-image.png")
        String key,
        @Schema(description = "Public URL of uploaded file", example = "https://cdn.example.local/lessons_assets/2c28d35e-image.png")
        String url
) {
}
