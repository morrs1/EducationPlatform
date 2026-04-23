package com.example.course_service.setup.config_beans.asset;

import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetInteractor;
import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.asset.services.AssetDomainService;
import com.example.course_service.infrasructure.adapters.file_storage.SeaweedFSLessonAssetRepo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AssetBeansConfig {

    @Bean
    public AddAssetInteractor addAssetInteractor(
            LessonRepo lessonRepo,
            SeaweedFSLessonAssetRepo fileStorage,
            TransactionManager transactionManager,
            AssetRepo assetRepo
    ) {
        return new AddAssetInteractor(lessonRepo, fileStorage, transactionManager, assetRepo, new AssetDomainService());
    }


}
