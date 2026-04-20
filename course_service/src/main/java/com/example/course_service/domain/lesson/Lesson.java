package com.example.course_service.domain.lesson;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.base.exceptions.ValidateException;
import com.example.course_service.domain.lesson.payload.CodingLessonPayload;
import com.example.course_service.domain.lesson.payload.LessonPayload;
import com.example.course_service.domain.lesson.payload.QuizLessonPayload;
import com.example.course_service.domain.lesson.payload.TheoryLessonPayload;
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
    private LessonPayload content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Lesson(
            UUID id,
            UUID courseId,
            LessonType type,
            LessonTitle title,
            LessonPayload content,
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
        validateContentType();
    }
    //TODO убрать эту валидацию отсюда и добавить в domainService
    private void validateContentType() {
        if (courseId == null) {
            throw new ValidateException("Lesson course id must not be null");
        }
        if (type == null) {
            throw new ValidateException("Lesson type must not be null");
        }
        if (title == null) {
            throw new ValidateException("Lesson title must not be null");
        }
        if (content == null) {
            throw new ValidateException("Lesson content must not be null");
        }

        boolean valid = switch (type.getLessonType()) {
            case "theory" -> content instanceof TheoryLessonPayload;
            case "quiz" -> content instanceof QuizLessonPayload;
            case "coding" -> content instanceof CodingLessonPayload;
            default -> false;
        };

        if (!valid) {
            throw new ValidateException("Lesson content does not match lesson type");
        }
    }
}
