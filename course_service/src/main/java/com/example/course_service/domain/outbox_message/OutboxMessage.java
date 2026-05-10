package com.example.course_service.domain.outbox_message;

import com.example.course_service.domain.base.BaseEntity;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class OutboxMessage extends BaseEntity {

    private final String payload;
    private final LocalDateTime processedAt;

    public OutboxMessage(UUID id, String payload, LocalDateTime processedAt) {
        super(id);
        this.payload = payload;
        this.processedAt = processedAt;
    }
}
