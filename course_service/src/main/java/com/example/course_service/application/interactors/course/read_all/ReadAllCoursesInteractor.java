package com.example.course_service.application.interactors.course.read_all;

import com.example.course_service.application.interactors.course.read_course_by_id.views.ReadCourseByIdView;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class ReadAllCoursesInteractor {

    private final TransactionManager transactionManager;
    private final CourseRepo courseRepo;
    private final CourseViewMapper mapper;

    public List<ReadCourseByIdView> readAll() {
        return transactionManager.inTransaction(() ->
                courseRepo.readAll().stream()
                        .map(mapper::toReadCourseByIdView)
                        .toList()
        );
    }
}
