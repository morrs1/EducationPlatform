package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.domain.asset.Asset;
import com.example.course_service.infrasructure.persistence.mappers.AssetHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.asset.HibernateAsset;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateAssetRepo implements AssetRepo {

    private final EntityManager entityManager;
    private final AssetHibernateMapper mapper;

    @Override
    public List<Asset> readAssetByLessonId(UUID lessonId) {
        return entityManager
                .createQuery("select a from HibernateAsset a where a.lessonId =:lessonId", HibernateAsset.class)
                .setParameter("lessonId", lessonId).getResultStream()
                .map(mapper::toDomainAsset)
                .toList();
    }

    @Override
    public void add(Asset asset) {
        var hibernateAsset = new HibernateAsset();
        hibernateAsset.setId(asset.getId());
        hibernateAsset.setCourseId(asset.getCourseId());
        hibernateAsset.setLessonId(asset.getLesson_id());
        hibernateAsset.setAssetType(asset.getType().getAssetType());
        hibernateAsset.setStorageKey(asset.getStorageKey().getStorageKey());
        hibernateAsset.setPublicUrl(asset.getPublicUrl().getPublicUrl());
        hibernateAsset.setMimeType(asset.getMimeType().getMimeType());
        hibernateAsset.setSizeBytes(asset.getSizeBytes().getSizeBytes());
        hibernateAsset.setOriginalFilename(asset.getOriginalFilename().getOriginalFilename());
        hibernateAsset.setTitle(asset.getTitle().getTitle());
        hibernateAsset.setCreated_at(asset.getCreatedAt() == null ? LocalDateTime.now() : asset.getCreatedAt());
        entityManager.persist(hibernateAsset);
    }
}
