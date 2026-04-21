package com.example.course_service.application.interactors.course.read_course_by_id;

import com.example.course_service.application.exceptions.CourseNotFoundException;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadCourseByIdInteractor {
    private final HibernateCourseRepo courseRepo;
    private final TransactionManager transactionManager;
    private final CourseViewMapper mapper;

    public ReadCourseByIdView readById(UUID id) {
        return mapper.toReadCourseByIdView(
                transactionManager.inTransaction(
                                () -> courseRepo.readById(id)
                        )
                        .orElseThrow(() -> new CourseNotFoundException("Course with this id was not found"))
        );
    }


}
