package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.util.UUID;

public record QuizOptionResponse(
        UUID id,
        String text,
        Boolean isCorrect
) {
}
