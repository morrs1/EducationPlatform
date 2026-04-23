package com.example.course_service.domain.asset.services;

import com.example.course_service.domain.asset.Asset;
import com.example.course_service.domain.asset.vo.*;
import com.example.course_service.domain.base.BaseDomainService;

import java.util.UUID;

public class AssetDomainService extends BaseDomainService {

    public Asset create(
            UUID courseId,
            UUID lessonId,
            String assetType,
            String storageKey,
            String publicUrl,
            String mimeType,
            Long sizeBytes,
            String originalFileName,
            String title
    ) {
        return new Asset(
                UUID.randomUUID(),
                courseId,
                lessonId,
                new AssetType(assetType),
                new AssetStorageKey(storageKey),
                new AssetPublicUrl(publicUrl),
                new AssetMimeType(mimeType),
                new AssetSizeBytes(sizeBytes),
                new AssetOriginalFilename(originalFileName),
                new AssetTitle(title),
                null
        );
    }

}
