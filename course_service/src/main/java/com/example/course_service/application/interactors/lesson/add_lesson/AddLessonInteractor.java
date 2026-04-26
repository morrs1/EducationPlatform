package com.example.course_service.application.interactors.lesson.add_lesson;

import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import com.example.course_service.domain.lesson.services.LessonDomainService;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class AddLessonInteractor {

    private final LessonRepo lessonRepo;
    private final CourseRepo courseRepo;
    private final TransactionManager transactionManager;
    private final LessonDomainService lessonDomainService;
    private final CourseDomainService courseDomainService;

    public UUID add(AddLessonCommand command) {
        return transactionManager.inTransaction(() -> {
            var lesson = lessonDomainService.create(
                    command.courseId(),
                    command.type(),
                    command.title()
            );
            var lessonId = lessonRepo.add(lesson);
            var lessonPreview = courseDomainService.createLessonPreview(
                    lessonId,
                    command.type(),
                    command.title(),
                    command.position(),
                    command.estimatedMinutes(),
                    command.isPreview()
            );
            courseRepo.addLessonPreview(command.courseId(), command.moduleId(), lessonPreview);
            return lessonId;
        });
    }
}
