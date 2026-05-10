package com.example.course_service.infrasructure.schedulers;

import com.example.course_service.application.ports.OutboxRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OutboxSpringScheduler {

    private final OutboxRepo outboxRepo;
    private final RabbitTemplate rabbitTemplate;

    @Scheduled(fixedRate = 5000)
    public void scheduleOutboxMessage() {
        var messages = outboxRepo.readNotProcessed();
        messages.forEach(
                msg -> {
                    rabbitTemplate.convertAndSend(
                            "",
                            "lesson.created",
                            MessageBuilder
                                    .withBody(msg.getPayload().getBytes(StandardCharsets.UTF_8))
                                    .setContentType(MessageProperties.CONTENT_TYPE_JSON)
                                    .build()
                    );
                    outboxRepo.markPrecessed(msg.getId());
                }
        );
    }


}
