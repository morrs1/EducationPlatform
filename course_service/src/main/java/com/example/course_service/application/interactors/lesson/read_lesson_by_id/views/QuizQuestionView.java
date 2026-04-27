package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.util.List;
import java.util.UUID;

public record QuizQuestionView(
        UUID id,
        String type,
        String text,
        List<QuizOptionView> options
) {
}
