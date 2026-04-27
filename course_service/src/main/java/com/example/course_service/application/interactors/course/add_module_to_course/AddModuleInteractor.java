package com.example.course_service.application.interactors.course.add_module_to_course;

import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class AddModuleInteractor {

    private final CourseRepo courseRepo;
    private final TransactionManager transactionManager;
    private final CourseDomainService courseDomainService;

    public UUID add(AddModuleCommand command) {
        return transactionManager.inTransaction(() -> {
            var module = courseDomainService.createModule(
                    command.courseId(),
                    command.title(),
                    command.description(),
                    command.position(),
                    command.estimatedMinutes()
            );
            return courseRepo.addModule(module);
        });
    }


}
