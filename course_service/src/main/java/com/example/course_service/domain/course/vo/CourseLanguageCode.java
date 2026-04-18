package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class CourseLanguageCode extends BaseValueObject {

    private final String languageCode;

    public CourseLanguageCode(String languageCode) {
        this.languageCode = languageCode;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(languageCode)) {
            throw new ValidateException("Course language code must not be null");
        }
        if (languageCode.isBlank()) {
            throw new ValidateException("Course language code must not be blank");
        }
        if (languageCode.length() > 16) {
            throw new ValidateException("Course language code length must not exceed 16 characters");
        }
    }
}
