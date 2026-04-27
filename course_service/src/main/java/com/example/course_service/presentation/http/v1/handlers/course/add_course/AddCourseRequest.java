package com.example.course_service.presentation.http.v1.handlers.course.add_course;

import java.util.List;
import java.util.UUID;

public record AddCourseRequest(
        UUID authorId,
        String courseTitle,
        String shortDescription,
        String description,
        String courseDifficulty,
        String languageCode,
        Integer estimatedMinutes,
        List<CourseTagRef> tags
) {
}
