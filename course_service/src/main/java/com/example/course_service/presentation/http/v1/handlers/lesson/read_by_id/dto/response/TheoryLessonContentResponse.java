package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

public record TheoryLessonContentResponse(
        String markdown
) implements LessonContentResponse {
}
