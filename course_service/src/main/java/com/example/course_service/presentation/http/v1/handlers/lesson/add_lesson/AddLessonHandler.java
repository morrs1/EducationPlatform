package com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson;

import com.example.course_service.application.interactors.lesson.add_lesson.AddLessonInteractor;
import com.example.course_service.presentation.http.v1.mappers.LessonMapperCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
public class AddLessonHandler {

    private final AddLessonInteractor interactor;
    private final LessonMapperCommand mapper;

    @PostMapping
    public UUID add(@RequestBody AddLessonRequest request) {
        return interactor.add(mapper.toAddLessonCommand(request));
    }
}
