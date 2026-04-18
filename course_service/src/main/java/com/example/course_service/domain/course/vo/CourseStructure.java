package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseStructure extends BaseValueObject {

    private final String structure;

    public CourseStructure(String structure) {
        this.structure = structure;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(structure)) {
            throw new ValidateException("Course structure must not be null");
        }
        if (structure.isBlank()) {
            throw new ValidateException("Course structure must not be blank");
        }
    }
}
