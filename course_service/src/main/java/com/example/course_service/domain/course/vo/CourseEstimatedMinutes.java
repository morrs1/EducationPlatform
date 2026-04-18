package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseEstimatedMinutes extends BaseValueObject {

    private final Integer estimatedMinutes;

    public CourseEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(estimatedMinutes)) {
            throw new ValidateException("Course estimated minutes must not be null");
        }
        if (estimatedMinutes < 0) {
            throw new ValidateException("Course estimated minutes must be greater than or equal to 0");
        }
    }
}
