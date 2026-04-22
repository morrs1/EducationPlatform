package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.asset.Asset;
import com.example.course_service.domain.asset.vo.*;
import com.example.course_service.infrasructure.persistence.models.asset.HibernateAsset;
import org.springframework.stereotype.Component;

@Component
public class AssetHibernateMapper {

    public Asset toDomainAsset(HibernateAsset hibernateAsset) {
        return new Asset(
                hibernateAsset.getId(),
                hibernateAsset.getCourseId(),
                hibernateAsset.getLessonId(),
                new AssetType(hibernateAsset.getAssetType()),
                new AssetStorageKey(hibernateAsset.getStorageKey()),
                new AssetPublicUrl(hibernateAsset.getPublicUrl()),
                new AssetMimeType(hibernateAsset.getMimeType()),
                new AssetSizeBytes(hibernateAsset.getSizeBytes()),
                new AssetOriginalFilename(hibernateAsset.getOriginalFilename()),
                new AssetTitle(hibernateAsset.getTitle()),
                hibernateAsset.getCreated_at()
        );
    }
}
