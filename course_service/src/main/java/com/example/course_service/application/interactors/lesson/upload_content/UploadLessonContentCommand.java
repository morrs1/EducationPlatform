package com.example.course_service.application.interactors.lesson.upload_content;

import java.util.Map;
import java.util.UUID;

public record UploadLessonContentCommand(
        UUID lessonId,
        Map<String, Object> content
) {
}
