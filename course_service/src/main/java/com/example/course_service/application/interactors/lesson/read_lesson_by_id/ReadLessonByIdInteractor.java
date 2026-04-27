package com.example.course_service.application.interactors.lesson.read_lesson_by_id;

import com.example.course_service.application.exceptions.LessonNotFoundException;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.views.ReadLessonByIdView;
import com.example.course_service.application.interactors.mappers.LessonViewMapper;
import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadLessonByIdInteractor {

    private final LessonRepo lessonRepo;
    private final TransactionManager transactionManager;
    private final LessonViewMapper mapper;
    private final AssetRepo assetRepo;

    public ReadLessonByIdView readById(UUID id) {
        return transactionManager.inTransaction(() -> {
            var lesson = lessonRepo.readById(id)
                    .orElseThrow(() -> new LessonNotFoundException("Lesson with this id was not found"));
            var assets = assetRepo.readAssetByLessonId(id);
            return mapper.toReadLessonByIdView(lesson, assets);
        });
    }
}
