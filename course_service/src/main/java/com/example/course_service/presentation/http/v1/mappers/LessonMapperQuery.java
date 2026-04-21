package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdView;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.ReadLessonByIdResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonMapperQuery {

    ReadLessonByIdResponse toReadLessonByIdResponse(ReadLessonByIdView readLessonByIdView);

}
