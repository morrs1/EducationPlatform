package com.example.course_service.infrasructure.adapters.event_handlers;

import com.example.course_service.application.ports.OutboxRepo;
import com.example.course_service.domain.lesson.events.UploadLessonContentEvent;
import com.example.course_service.domain.outbox_message.OutboxMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class LessonEventsHandler {

    private final OutboxRepo outboxRepo;
    private final ObjectMapper objectMapper;

    @EventListener(UploadLessonContentEvent.class)
    public void handle(UploadLessonContentEvent event) {
        UploadLessonContentOutboxPayload payload = UploadLessonContentOutboxPayload.fromEvent(event);
        String jsonPayload;
        try {
            jsonPayload = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize UploadLessonContentEvent to outbox JSON", e);
        }
        outboxRepo.add(new OutboxMessage(UUID.randomUUID(), jsonPayload, null));
    }
}
