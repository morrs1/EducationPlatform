package com.example.course_service.presentation.http.v1.handlers.course.add_course;

import com.example.course_service.application.interactors.course.add_course.AddCourseInteractor;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
public class AddCourseHandler {

    private final AddCourseInteractor courseInteractor;
    private final CourseMapperCommand mapper;

    @PostMapping
    public UUID add(@RequestBody AddCourseRequest request) {
        return courseInteractor.add(mapper.toAddCourseCommand(request));
    }

}
