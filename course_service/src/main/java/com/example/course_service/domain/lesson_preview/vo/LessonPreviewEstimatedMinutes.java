package com.example.course_service.domain.lesson_preview.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class LessonPreviewEstimatedMinutes extends BaseValueObject {

    private final Integer estimatedMinutes;

    public LessonPreviewEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(estimatedMinutes)) {
            throw new ValidateException("Lesson preview estimated minutes must not be null");
        }
        if (estimatedMinutes < 0) {
            throw new ValidateException("Lesson preview estimated minutes must be greater than or equal to 0");
        }
    }
}
