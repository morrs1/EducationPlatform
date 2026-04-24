package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.course.add_course.AddCourseCommand;
import com.example.course_service.presentation.http.v1.handlers.course.add_course.AddCourseRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapperCommand {

    AddCourseCommand toAddCourseCommand(AddCourseRequest request);

}
