package com.example.course_service.presentation.http.v1.handlers.course.add_module_to_course;

import com.example.course_service.application.interactors.course.add_module_to_course.AddModuleInteractor;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
public class AddModuleHandler {

    private final AddModuleInteractor interactor;
    private final CourseMapperCommand mapper;

    @PostMapping("/{id}/module")
    public UUID add(@PathVariable("id") UUID courseId, @RequestBody AddModuleRequest request) {
        return interactor.add(mapper.toAddModuleCommand(request, courseId));
    }
}
