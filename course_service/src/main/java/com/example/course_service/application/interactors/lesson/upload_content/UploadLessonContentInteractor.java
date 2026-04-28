package com.example.course_service.application.interactors.lesson.upload_content;

import com.example.course_service.application.exceptions.LessonNotFoundException;
import com.example.course_service.application.ports.LessonPayloadMapper;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.lesson.services.LessonDomainService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UploadLessonContentInteractor {

    private final LessonRepo lessonRepo;
    private final LessonPayloadMapper lessonPayloadMapper;
    private final TransactionManager transactionManager;
    private final LessonDomainService domainService;

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
        });
    }

}
