package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class TagName extends BaseValueObject {

    private final String name;

    public TagName(String name) {
        this.name = name;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(name)) {
            throw new ValidateException("Tag name must not be null");
        }
        if (name.isBlank()) {
            throw new ValidateException("Tag name must not be blank");
        }
        if (name.length() > 64) {
            throw new ValidateException("Tag name length must not exceed 64 characters");
        }
    }
}
