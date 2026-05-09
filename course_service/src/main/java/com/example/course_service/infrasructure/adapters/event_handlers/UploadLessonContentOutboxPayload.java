package com.example.course_service.infrasructure.adapters.event_handlers;

import com.example.course_service.domain.lesson.events.UploadLessonContentEvent;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JSON-serializable view of {@link UploadLessonContentEvent}: all business fields
 * plus {@code createAt} from the base event, explicitly excluding the event {@code id}.
 */
public record UploadLessonContentOutboxPayload(
        UUID lessonId,
        String title,
        String content
) {
    public static UploadLessonContentOutboxPayload fromEvent(UploadLessonContentEvent event) {
        return new UploadLessonContentOutboxPayload(
                event.getLessonId(),
                event.getTitle(),
                event.getContent()
        );
    }
}
