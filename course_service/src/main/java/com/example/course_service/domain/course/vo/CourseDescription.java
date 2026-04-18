package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseDescription extends BaseValueObject {

    private final String description;

    public CourseDescription(String description) {
        this.description = description;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(description)) {
            throw new ValidateException("Course description must not be null");
        }
        if (description.isBlank()) {
            throw new ValidateException("Course description must not be blank");
        }
    }
}
