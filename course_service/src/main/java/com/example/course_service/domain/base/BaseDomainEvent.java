package com.example.course_service.domain.base;

import java.time.LocalDateTime;
import java.util.UUID;

public abstract class BaseDomainEvent {
    protected final UUID id = UUID.randomUUID();
    protected final LocalDateTime createAt = LocalDateTime.now();
}
