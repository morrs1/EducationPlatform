package com.example.course_service.application.interactors.asset.add_asset_to_lesson;

import com.example.course_service.application.exceptions.LessonNotFoundException;
import com.example.course_service.application.ports.AssetFileStorage;
import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.asset.services.AssetDomainService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AddAssetInteractor {

    private final LessonRepo lessonRepo;
    private final AssetFileStorage fileStorage;
    private final TransactionManager transactionManager;
    private final AssetRepo assetRepo;
    private final AssetDomainService assetDomainService;

    public AddAssetView add(AddAssetCommand command) {
        var lesson = transactionManager.inTransaction(
                        () -> lessonRepo.readById(command.lessonId())
                )
                .orElseThrow(() -> new LessonNotFoundException("Lesson with this id was not found"));
        var addedAsset = fileStorage.add(command);
        var asset = assetDomainService.create(
                lesson.getCourseId(),
                lesson.getId(),
                command.assetType(),
                addedAsset.key(),
                addedAsset.url(),
                command.mimeType(),
                command.sizeBytes(),
                command.originalFileName(),
                command.title()
        );
        transactionManager.inTransaction(() -> assetRepo.add(asset));
        return new AddAssetView(addedAsset.key(), addedAsset.url());
    }


}
