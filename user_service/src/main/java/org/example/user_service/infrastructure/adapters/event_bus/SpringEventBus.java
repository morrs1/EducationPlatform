package org.example.user_service.infrastructure.adapters.event_bus;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.domain.base.BaseDomainEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SpringEventBus implements EventBus {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void publish(List<BaseDomainEvent> events) {
        events.forEach(eventPublisher::publishEvent);
    }
}
