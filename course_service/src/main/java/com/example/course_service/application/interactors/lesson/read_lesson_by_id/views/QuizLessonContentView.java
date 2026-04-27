package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.util.List;

public record QuizLessonContentView(
        String introMarkdown,
        List<QuizQuestionView> questions
) implements LessonContentView {
}
