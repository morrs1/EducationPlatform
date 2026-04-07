package org.example.user_service.domain.base;

import java.time.LocalDateTime;
import java.util.UUID;

public abstract class BaseDomainEvent {
    protected final UUID eventId = UUID.randomUUID();
    protected final LocalDateTime createdAt = LocalDateTime.now();
}
