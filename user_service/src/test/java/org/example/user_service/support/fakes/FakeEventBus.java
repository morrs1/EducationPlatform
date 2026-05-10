package org.example.user_service.support.fakes;

import java.util.ArrayList;
import java.util.List;

import org.example.user_service.application.ports.EventBus;
import org.example.user_service.domain.base.BaseDomainEvent;

/**
 * In-memory {@link EventBus} that collects everything published to it.
 * Tests can then assert how many events were emitted, and of which type.
 */
public final class FakeEventBus implements EventBus {

    private final List<BaseDomainEvent> published = new ArrayList<>();

    @Override
    public void publish(List<BaseDomainEvent> events) {
        published.addAll(events);
    }

    public List<BaseDomainEvent> published() {
        return List.copyOf(published);
    }

    public int publishedCount() {
        return published.size();
    }
}
