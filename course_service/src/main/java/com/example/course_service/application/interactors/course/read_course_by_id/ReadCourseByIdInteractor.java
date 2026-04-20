package com.example.course_service.application.interactors.course.read_course_by_id;

import com.example.course_service.application.exceptions.CourseNotFoundException;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import com.example.course_service.infrasructure.adapters.persistence.HibernateLessonRepo;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadCourseByIdInteractor {
//TODO убрать repo lesson
    private final HibernateCourseRepo courseRepo;
    private final TransactionManager transactionManager;
    private final CourseViewMapper mapper;
    private final HibernateLessonRepo lessonRepo;

    public ReadCourseByIdView readById(UUID id) {
        System.out.println(lessonRepo.readById(UUID.fromString("a1fba630-a0d4-42fb-8248-199801c35084")).orElseThrow());
        return mapper.toReadCourseByIdView(
                transactionManager.inTransaction(() -> courseRepo.readById(id)).orElseThrow(
                        () -> new CourseNotFoundException("Course with this id was not found")
                )
        );

    }


}
