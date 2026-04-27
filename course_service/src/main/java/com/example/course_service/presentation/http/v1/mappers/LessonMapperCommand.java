package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.lesson.add_lesson.AddLessonCommand;
import com.example.course_service.application.interactors.lesson.upload_content.UploadLessonContentCommand;
import com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson.AddLessonRequest;
import com.example.course_service.presentation.http.v1.handlers.lesson.upload_content.UploadLessonContentRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface LessonMapperCommand {

    AddLessonCommand toAddLessonCommand(AddLessonRequest request);

    @Mapping(target = "lessonId", source = "lessonId")
    UploadLessonContentCommand toUploadLessonContentCommand(UploadLessonContentRequest request, UUID lessonId);
}
