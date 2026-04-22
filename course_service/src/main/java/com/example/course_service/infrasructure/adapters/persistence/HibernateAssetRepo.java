package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.domain.asset.Asset;
import com.example.course_service.infrasructure.persistence.mappers.AssetHibernateMapper;
import com.example.course_service.infrasructure.persistence.models.asset.HibernateAsset;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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
}
