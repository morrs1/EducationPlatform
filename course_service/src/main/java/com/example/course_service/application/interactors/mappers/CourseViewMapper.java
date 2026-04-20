package com.example.course_service.application.interactors.mappers;

import com.example.course_service.application.interactors.read_course_by_id.ReadCourseByIdView;
import com.example.course_service.domain.course.Course;

public class CourseViewMapper {

    public ReadCourseByIdView toReadCourseByIdView(Course course) {
        return new ReadCourseByIdView(
                course.getAuthorId(),
                course.getTitle().getTitle(),
                course.getShortDescription().getShortDescription(),
                course.getDescription().getDescription(),
                course.getDifficulty().getDifficulty(),
                course.getLanguageCode().getLanguageCode(),
                course.getEstimatedMinutes().getEstimatedMinutes(),
                course.getStructure(),
                course.getCreatedAt(),
                course.getUpdatedAt(),
                course.getTags()
        );

    }
}
