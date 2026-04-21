package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdView;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.ReadCourseByIdResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapperQuery {

    ReadCourseByIdResponse toReadCourseByIdResponse(ReadCourseByIdView readCourseByIdView);

}
