package com.example.course_service.application.interactors.asset.add_asset_to_lesson;

import java.util.UUID;

public record AddAssetCommand(
        UUID lessonId,
        String title,
        String originalFileName,
        String assetType,
        String mimeType,
        long sizeBytes,
        byte[] content
) {
}
