package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.outbox_message.OutboxMessage;
import com.example.course_service.infrasructure.persistence.models.outbox.HibernateOutboxMessage;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = "spring")
public interface OutboxMessageHibernateMapper {

    HibernateOutboxMessage toHibernateOutboxMessage(OutboxMessage message);

    OutboxMessage toOutboxMessage(HibernateOutboxMessage message);
}
