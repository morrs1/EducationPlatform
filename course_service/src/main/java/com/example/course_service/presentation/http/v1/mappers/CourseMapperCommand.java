package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.course.add_course.AddCourseCommand;
import com.example.course_service.application.interactors.course.add_module_to_course.AddModuleCommand;
import com.example.course_service.domain.tag.Tag;
import com.example.course_service.presentation.http.v1.handlers.course.add_course.CourseTagRef;
import com.example.course_service.presentation.http.v1.handlers.course.add_course.AddCourseRequest;
import com.example.course_service.presentation.http.v1.handlers.course.add_module_to_course.AddModuleRequest;
import org.hibernate.boot.internal.Target;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CourseMapperCommand {

    AddCourseCommand toAddCourseCommand(AddCourseRequest request);

    @Mapping(target = "courseId", source = "courseId")
    AddModuleCommand toAddModuleCommand(AddModuleRequest request, UUID courseId);

    default Tag toTag(CourseTagRef tagRef) {
        if (tagRef == null) {
            return null;
        }
        return new Tag(tagRef.id(), null);
    }

}
