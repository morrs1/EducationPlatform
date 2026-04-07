package org.example.user_service.domain.base;

import java.util.LinkedList;
import java.util.List;

public class BaseDomainService {

    protected final LinkedList<BaseDomainEvent> events = new LinkedList<>();

    protected void recordEvent(BaseDomainEvent event) {
        events.add(event);
    }

    protected void recordEvents(List<BaseDomainEvent> events) {
        this.events.addAll(events);
    }

    public void clearEvents() {
        events.clear();
    }

    public List<BaseDomainEvent> getEvents() {
        return events;
    }

    public List<BaseDomainEvent> pull_events() {
        var events = List.copyOf(this.events);
        this.events.clear();
        return events;
    }


}
