package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

public sealed interface LessonContentResponse permits TheoryLessonContentResponse, QuizLessonContentResponse, CodingLessonContentResponse {
}
