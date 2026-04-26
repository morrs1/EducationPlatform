package com.example.course_service.domain.course.services;

import com.example.course_service.domain.base.BaseDomainService;
import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.course.vo.*;
import com.example.course_service.domain.tag.Tag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CourseDomainService extends BaseDomainService {

    public Course create(
            UUID authorId,
            String courseTitle,
            String shortDescription,
            String description,
            String courseDifficulty,
            String languageCode,
            Integer estimatedMinutes,
            List<Tag> tags
    ) {
        return new Course(
                UUID.randomUUID(),
                authorId,
                new CourseTitle(courseTitle),
                new CourseShortDescription(shortDescription),
                new CourseDescription(description),
                new CourseDifficulty(courseDifficulty),
                new CourseLanguageCode(languageCode),
                new CourseEstimatedMinutes(estimatedMinutes),
                List.of(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                tags
        );
    }
}
