package org.example.user_service.infrastructure.event_handlers;

import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserEventHandler {

    @EventListener
    public void createUserEventHandler(CreateUserDomainEvent event) {
        System.out.println(event.toString());
    }
}
