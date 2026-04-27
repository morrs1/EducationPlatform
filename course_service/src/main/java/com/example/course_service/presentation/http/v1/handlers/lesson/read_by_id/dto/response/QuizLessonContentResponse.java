package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.util.List;

public record QuizLessonContentResponse(
        String introMarkdown,
        List<QuizQuestionResponse> questions
) implements LessonContentResponse {
}
