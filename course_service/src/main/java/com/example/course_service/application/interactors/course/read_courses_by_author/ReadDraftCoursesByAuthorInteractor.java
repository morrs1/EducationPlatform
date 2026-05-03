package com.example.course_service.application.interactors.course.read_courses_by_author;

import com.example.course_service.application.interactors.course.read_course_by_id.views.ReadCourseByIdView;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ReadDraftCoursesByAuthorInteractor {

    private final TransactionManager transactionManager;
    private final CourseRepo courseRepo;
    private final CourseViewMapper courseViewMapper;

    public List<ReadCourseByIdView> read(UUID authorId) {
        return transactionManager.inTransaction(() ->
                courseRepo.readDraftCoursesByAuthor(authorId).stream()
                        .map(courseViewMapper::toReadCourseByIdView)
                        .toList());
    }
}
