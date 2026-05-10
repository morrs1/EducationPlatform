package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.outbox_message.OutboxMessage;
import com.example.course_service.infrasructure.persistence.models.outbox.HibernateOutboxMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OutboxMessageHibernateMapper {

    private final ObjectMapper objectMapper;

    public HibernateOutboxMessage toHibernateOutboxMessage(OutboxMessage message) {
        var hibernateMessage = new HibernateOutboxMessage();
        hibernateMessage.setId(message.getId());
        hibernateMessage.setPayload(readPayload(message.getPayload()));
        hibernateMessage.setProcessedAt(message.getProcessedAt());
        return hibernateMessage;
    }

    public OutboxMessage toOutboxMessage(HibernateOutboxMessage message) {
        return new OutboxMessage(
                message.getId(),
                writePayload(message),
                message.getProcessedAt()
        );
    }

    private JsonNode readPayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Outbox payload must be valid JSON", e);
        }
    }

    private String writePayload(HibernateOutboxMessage message) {
        try {
            return objectMapper.writeValueAsString(message.getPayload());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize outbox payload", e);
        }
    }
}
