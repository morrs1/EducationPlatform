package com.example.course_service.infrasructure.adapters.persistence;

import com.example.course_service.application.ports.OutboxRepo;
import com.example.course_service.domain.outbox_message.OutboxMessage;
import com.example.course_service.infrasructure.persistence.mappers.OutboxMessageHibernateMapper;
import com.example.course_service.infrasructure.persistence.repositories.outbox.OutboxSpringDataRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateOutboxRepo implements OutboxRepo {

    private final OutboxSpringDataRepo repo;
    private final OutboxMessageHibernateMapper mapper;

    @Override
    public void add(OutboxMessage message) {
        repo.save(mapper.toHibernateOutboxMessage(message));
    }

    @Override
    public List<OutboxMessage> readNotProcessed() {
        return repo.findByProcessedAtIsNull().stream().map(mapper::toOutboxMessage).toList();
    }

    //TODO добавить exception
    @Override
    public void markPrecessed(UUID id) {
        var message = repo.findById(id).orElseThrow();
        message.setProcessedAt(LocalDateTime.now());
        repo.save(message);
    }
}
