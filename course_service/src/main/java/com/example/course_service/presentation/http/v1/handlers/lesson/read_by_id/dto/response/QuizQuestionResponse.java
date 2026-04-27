package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.util.List;
import java.util.UUID;

public record QuizQuestionResponse(
        UUID id,
        String type,
        String text,
        List<QuizOptionResponse> options
) {
}
