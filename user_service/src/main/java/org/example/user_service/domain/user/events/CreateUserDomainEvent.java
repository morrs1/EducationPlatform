package org.example.user_service.domain.user.events;

import lombok.Getter;
import org.example.user_service.domain.base.BaseDomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class CreateUserDomainEvent extends BaseDomainEvent {

    private final UUID userId;
    private final String userEmail;

    public CreateUserDomainEvent(UUID userId, String userEmail) {
        this.userId = userId;
        this.userEmail = userEmail;
    }
}
