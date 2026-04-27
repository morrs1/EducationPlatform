package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Typed lesson content union")
public sealed interface LessonContentResponse permits TheoryLessonContentResponse, QuizLessonContentResponse, CodingLessonContentResponse {
}
