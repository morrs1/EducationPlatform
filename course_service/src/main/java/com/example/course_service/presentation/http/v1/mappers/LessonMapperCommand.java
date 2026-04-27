package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.lesson.add_lesson.AddLessonCommand;
import com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson.AddLessonRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonMapperCommand {

    AddLessonCommand toAddLessonCommand(AddLessonRequest request);
}
