package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdInteractor;
import com.example.course_service.presentation.http.v1.mappers.LessonMapperQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
public class ReadLessonByIdHandler {

    private final ReadLessonByIdInteractor interactor;
    private final LessonMapperQuery mapper;

    @GetMapping("/{id}")
    public ReadLessonByIdResponse readById(@PathVariable UUID id) {
        return mapper.toReadLessonByIdResponse(interactor.readById(id));
    }
}
