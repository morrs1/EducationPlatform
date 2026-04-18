package com.example.course_service.domain.asset;

import com.example.course_service.domain.asset.vo.*;
import com.example.course_service.domain.base.BaseEntity;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@ToString
public class Asset extends BaseEntity {

    private UUID courseId;
    private UUID lesson_id;
    private AssetType type;
    private AssetStorageKey storageKey;
    private AssetPublicUrl publicUrl;
    private AssetMimeType mimeType;
    private AssetSizeBytes sizeBytes;
    private AssetOriginalFilename originalFilename;
    private AssetTitle title;
    private LocalDateTime createdAt;

    public Asset(
            UUID id,
            UUID courseId,
            UUID lesson_id,
            AssetType type,
            AssetStorageKey storageKey,
            AssetPublicUrl publicUrl,
            AssetMimeType mimeType,
            AssetSizeBytes sizeBytes,
            AssetOriginalFilename originalFilename,
            AssetTitle title,
            LocalDateTime createdAt
    ) {
        super(id);
        this.courseId = courseId;
        this.lesson_id = lesson_id;
        this.type = type;
        this.storageKey = storageKey;
        this.publicUrl = publicUrl;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
        this.originalFilename = originalFilename;
        this.title = title;
        this.createdAt = createdAt;
    }
}


