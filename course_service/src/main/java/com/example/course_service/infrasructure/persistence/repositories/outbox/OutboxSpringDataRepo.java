package com.example.course_service.infrasructure.persistence.repositories.outbox;

import com.example.course_service.infrasructure.persistence.models.outbox.HibernateOutboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxSpringDataRepo extends JpaRepository<HibernateOutboxMessage, UUID> {

    List<HibernateOutboxMessage> findByProcessedAtIsNull();

}
