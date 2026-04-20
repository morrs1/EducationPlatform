package com.example.course_service.presentation.http.v1.handlers.course.read_by_id;

import com.example.course_service.domain.course.vo.*;
import com.example.course_service.domain.module.Module;
import com.example.course_service.domain.tag.Tag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReadCourseByIdResponse(
        UUID authorId,
        String title,
        String shortDescription,
        String description,
        String difficulty,
        String languageCode,
        Integer estimatedMinutes,
        List<Module> structure,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<Tag> tags
) {
}
