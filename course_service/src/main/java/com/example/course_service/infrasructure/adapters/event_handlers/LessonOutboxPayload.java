package com.example.course_service.infrasructure.adapters.event_handlers;

import com.example.course_service.domain.lesson.events.CreateLessonEvent;
import com.example.course_service.domain.lesson.events.UploadLessonContentEvent;

import java.util.UUID;

/**
 * JSON-serializable view of {@link UploadLessonContentEvent}: all business fields
 * plus {@code createAt} from the base event, explicitly excluding the event {@code id}.
 */
public record LessonOutboxPayload(
        UUID lessonId,
        String title,
        String content
) {
    public static LessonOutboxPayload fromEvent(UploadLessonContentEvent event) {
        return new LessonOutboxPayload(
                event.getLessonId(),
                event.getNewTitle(),
                event.getNewContent()
        );
    }

    public static LessonOutboxPayload fromEvent(CreateLessonEvent event) {
        return new LessonOutboxPayload(
                event.getLessonId(),
                event.getTitle(),
                event.getContent()
        );
    }
}
