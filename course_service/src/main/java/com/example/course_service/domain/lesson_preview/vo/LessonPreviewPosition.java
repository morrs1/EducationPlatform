package com.example.course_service.domain.lesson_preview.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class LessonPreviewPosition extends BaseValueObject {

    private final Integer position;

    public LessonPreviewPosition(Integer position) {
        this.position = position;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(position)) {
            throw new ValidateException("Lesson preview position must not be null");
        }
        if (position <= 0) {
            throw new ValidateException("Lesson preview position must be greater than 0");
        }
    }
}
