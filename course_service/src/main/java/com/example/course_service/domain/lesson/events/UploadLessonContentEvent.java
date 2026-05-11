package com.example.course_service.domain.lesson.events;

import com.example.course_service.domain.base.BaseDomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
@Getter
public class UploadLessonContentEvent extends BaseDomainEvent {

    private final UUID lessonId;
    private final String newTitle;
    private final String newContent;

}
