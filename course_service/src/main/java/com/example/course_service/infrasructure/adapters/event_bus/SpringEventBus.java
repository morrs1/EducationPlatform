package com.example.course_service.infrasructure.adapters.event_bus;

import com.example.course_service.application.ports.EventBus;
import com.example.course_service.domain.base.BaseDomainEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SpringEventBus implements EventBus {

    private final ApplicationEventPublisher eventPublisher;

    public void publish(List<BaseDomainEvent> events) {
        events.forEach(eventPublisher::publishEvent);
    }
}
