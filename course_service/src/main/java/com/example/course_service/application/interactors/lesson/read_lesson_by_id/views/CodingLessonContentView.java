package com.example.course_service.application.interactors.lesson.read_lesson_by_id.views;

import java.util.List;

public record CodingLessonContentView(
        String taskMarkdown,
        String checkerType,
        List<CodingLanguageTemplateView> languages,
        List<CodingTestCaseView> testCases
) implements LessonContentView {
}
