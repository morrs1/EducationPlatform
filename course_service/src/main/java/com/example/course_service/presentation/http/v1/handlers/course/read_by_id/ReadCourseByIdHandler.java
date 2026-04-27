package com.example.course_service.presentation.http.v1.handlers.course.read_by_id;

import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdInteractor;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
public class ReadCourseByIdHandler {
    //TODO изменить дто так, чтобы они не были вложенными обьектами
    private final ReadCourseByIdInteractor interactor;
    private final CourseMapperQuery mapper;

    @GetMapping("{id}")
    public ReadCourseByIdResponse readById(@PathVariable UUID id) {
        return mapper.toReadCourseByIdResponse(interactor.readById(id));
    }
}
