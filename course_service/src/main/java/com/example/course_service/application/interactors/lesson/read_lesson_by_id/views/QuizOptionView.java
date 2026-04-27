package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.util.UUID;

public record QuizOptionView(
        UUID id,
        String text,
        Boolean isCorrect
) {
}
