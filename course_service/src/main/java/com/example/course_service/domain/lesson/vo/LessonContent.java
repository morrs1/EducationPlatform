package com.example.course_service.domain.lesson.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class LessonContent extends BaseValueObject {

    private final String content;

    public LessonContent(String content) {
        this.content = content;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(content)) {
            throw new ValidateException("Lesson payload must not be null");
        }
        if (content.isBlank()) {
            throw new ValidateException("Lesson payload must not be blank");
        }
    }
}
