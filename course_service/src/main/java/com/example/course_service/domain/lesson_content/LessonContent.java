package com.example.course_service.domain.lesson_content;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.lesson_content.vo.LessonContentContent;
import com.example.course_service.domain.lesson_content.vo.LessonContentTitle;
import com.example.course_service.domain.lesson_content.vo.LessonContentType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class LessonContent extends BaseEntity {

    private UUID courseId;
    private LessonContentType type;
    private LessonContentTitle title;
    private LessonContentContent content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LessonContent(
            UUID id,
            UUID courseId,
            LessonContentType type,
            LessonContentTitle title,
            LessonContentContent content,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        super(id);
        this.courseId = courseId;
        this.type = type;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
