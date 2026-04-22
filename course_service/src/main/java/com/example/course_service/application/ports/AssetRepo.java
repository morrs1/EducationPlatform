package com.example.course_service.application.ports;

import com.example.course_service.domain.asset.Asset;

import java.util.List;
import java.util.UUID;

public interface AssetRepo {
    List<Asset> readAssetByLessonId(UUID lessonId);
}
