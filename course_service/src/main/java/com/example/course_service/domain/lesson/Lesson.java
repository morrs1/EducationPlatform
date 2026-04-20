package com.example.course_service.domain.lesson;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.lesson.vo.LessonContent;
import com.example.course_service.domain.lesson.vo.LessonTitle;
import com.example.course_service.domain.lesson.vo.LessonType;
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
public class Lesson extends BaseEntity {

    private UUID courseId;
    private LessonType type;
    private LessonTitle title;
    private LessonContent content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Lesson(
            UUID id,
            UUID courseId,
            LessonType type,
            LessonTitle title,
            LessonContent content,
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
