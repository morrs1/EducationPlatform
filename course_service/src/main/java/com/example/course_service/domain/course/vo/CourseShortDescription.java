package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseShortDescription extends BaseValueObject {

    private final String shortDescription;

    public CourseShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(shortDescription)) {
            throw new ValidateException("Course short description must not be null");
        }
        if (shortDescription.isBlank()) {
            throw new ValidateException("Course short description must not be blank");
        }
        if (shortDescription.length() > 500) {
            throw new ValidateException("Course short description length must not exceed 500 characters");
        }
    }
}
