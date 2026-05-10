package com.example.course_service.infrasructure.persistence.models.outbox;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "outbox_messages")
@Getter
@Setter
public class HibernateOutboxMessage {
    @Id
    private UUID id;

    private String payload;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;


}
