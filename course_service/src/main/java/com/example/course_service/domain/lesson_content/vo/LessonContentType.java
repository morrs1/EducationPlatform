package com.example.course_service.domain.lesson_content.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.Set;

@ToString
@Getter
public class LessonContentType extends BaseValueObject {

    private static final Set<String> ALLOWED_TYPES =
            Set.of("theory", "quiz", "coding");

    private final String lessonType;

    public LessonContentType(String lessonType) {
        this.lessonType = lessonType;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(lessonType)) {
            throw new ValidateException("Lesson content type must not be null");
        }
        if (lessonType.isBlank()) {
            throw new ValidateException("Lesson content type must not be blank");
        }
        if (!ALLOWED_TYPES.contains(lessonType)) {
            throw new ValidateException("Lesson content type must be one of: theory, quiz, coding");
        }
    }
}
