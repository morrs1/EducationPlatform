package com.example.course_service.domain.lesson.events;

import com.example.course_service.domain.base.BaseDomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Getter
@RequiredArgsConstructor
public class CreateLessonEvent extends BaseDomainEvent {
    private final UUID lessonId;
    private final String title;
    private final String content;
}
