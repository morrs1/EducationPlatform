package com.example.course_service.application.ports;

import com.example.course_service.domain.base.BaseDomainEvent;

import java.util.List;

public interface EventBus {
    void publish(List<BaseDomainEvent> events);
}
