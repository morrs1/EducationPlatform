package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;

import java.util.Objects;

@Getter
public class TheoryLessonPayload extends BaseValueObject implements LessonPayload {

    private final String markdown;

    public TheoryLessonPayload(String markdown) {
        this.markdown = markdown;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(markdown)) {
            throw new ValidateException("Theory lesson markdown must not be null");
        }
        if (markdown.isBlank()) {
            throw new ValidateException("Theory lesson markdown must not be blank");
        }
    }

    @Override
    public String toString() {
        return "markdown=" + markdown;
    }
}
