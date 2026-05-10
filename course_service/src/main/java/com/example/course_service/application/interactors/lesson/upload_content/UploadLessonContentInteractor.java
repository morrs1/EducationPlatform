package com.example.course_service.application.interactors.lesson.upload_content;

import com.example.course_service.application.exceptions.LessonNotFoundException;
import com.example.course_service.application.ports.*;
import com.example.course_service.domain.lesson.services.LessonDomainService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UploadLessonContentInteractor {

    private final LessonRepo lessonRepo;
    private final LessonPayloadMapper lessonPayloadMapper;
    private final TransactionManager transactionManager;
    private final LessonDomainService domainService;
    private final EventBus eventBus;

    public void uploadContent(UploadLessonContentCommand command) {
        transactionManager.inTransaction(() -> {
            var lesson = lessonRepo.readById(command.lessonId())
                    .orElseThrow(() -> new LessonNotFoundException("Lesson with this id was not found"));
            var payload = lessonPayloadMapper.fromMap(
                    lesson.getType().getLessonType(),
                    command.content()
            );
            domainService.uploadContent(lesson, payload);
            lessonRepo.uploadContent(lesson);
            eventBus.publish(domainService.pullEvents());
        });
    }

}
