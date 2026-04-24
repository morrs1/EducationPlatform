package com.example.course_service.application.interactors.course.add_course;

import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RequiredArgsConstructor
public class AddCourseInteractor {

    private final TransactionManager transactionManager;
    private final CourseRepo courseRepo;
    private final CourseDomainService courseDomainService;

    public UUID add(AddCourseCommand command) {
        return transactionManager.inTransaction(() -> {
            var course = courseDomainService.create(
                    command.authorId(),
                    command.courseTitle(),
                    command.shortDescription(),
                    command.description(),
                    command.courseDifficulty(),
                    command.languageCode(),
                    command.estimatedMinutes(),
                    Objects.isNull(command.tags()) ? List.of() : List.copyOf(command.tags())
            );
            return courseRepo.add(course);
        });
    }

}
