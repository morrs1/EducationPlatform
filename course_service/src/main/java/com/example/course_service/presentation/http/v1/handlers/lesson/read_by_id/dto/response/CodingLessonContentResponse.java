package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response;

import java.util.List;

public record CodingLessonContentResponse(
        String taskMarkdown,
        String checkerType,
        List<CodingLanguageTemplateResponse> languages,
        List<CodingTestCaseResponse> testCases
) implements LessonContentResponse {
}
