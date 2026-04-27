package com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response;

import java.util.UUID;

public record TagResponse(
        UUID id,
        String name
) {
}
