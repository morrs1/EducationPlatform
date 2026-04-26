package com.example.course_service.application.interactors.course.add_course;

import com.example.course_service.domain.tag.Tag;

import java.util.List;
import java.util.UUID;

public record AddCourseCommand(
        UUID authorId,
        String courseTitle,
        String shortDescription,
        String description,
        String courseDifficulty,
        String languageCode,
        Integer estimatedMinutes,
        List<Tag> tags
) {
}
