package com.example.course_service.application.interactors.course.read_course_by_id.views;

import java.util.UUID;

public record TagView(
        UUID id,
        String name
) {
}
