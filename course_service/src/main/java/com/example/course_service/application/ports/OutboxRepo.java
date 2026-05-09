package com.example.course_service.application.ports;

import com.example.course_service.domain.outbox_message.OutboxMessage;

import java.util.List;
import java.util.UUID;

public interface OutboxRepo {

    void add(OutboxMessage message);

    List<OutboxMessage> readNotProcessed();

    void markPrecessed(UUID id);


}
