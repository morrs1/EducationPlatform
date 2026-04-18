package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseTitle extends BaseValueObject {

    private final String title;

    public CourseTitle(String title) {
        this.title = title;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(title)) {
            throw new ValidateException("Course title must not be null");
        }
        if (title.isBlank()) {
            throw new ValidateException("Course title must not be blank");
        }
        if (title.length() > 255) {
            throw new ValidateException("Course title length must not exceed 255 characters");
        }
    }
}
