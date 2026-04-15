package org.example.user_service.application.ports;

import org.example.user_service.domain.base.BaseDomainEvent;

import java.util.List;

public interface EventBus {
    void publish(List<BaseDomainEvent> events);
}
