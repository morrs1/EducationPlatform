package com.example.course_service.application.interactors.course.search_courses;

import com.example.course_service.application.interactors.course.read_course_by_id.views.ReadCourseByIdView;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class SearchCoursesInteractor {

    private final TransactionManager transactionManager;
    private final CourseRepo courseRepo;
    private final CourseViewMapper courseViewMapper;

    public List<ReadCourseByIdView> search(String query) {
        return transactionManager.inTransaction(() ->
                courseRepo.readByString(query == null ? "" : query).stream()
                        .map(courseViewMapper::toReadCourseByIdView)
                        .toList());
    }
}
