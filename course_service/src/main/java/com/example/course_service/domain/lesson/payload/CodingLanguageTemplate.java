package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@Getter
@ToString
public class CodingLanguageTemplate extends BaseValueObject {

    private final String language;
    private final String starterCode;

    public CodingLanguageTemplate(String language, String starterCode) {
        this.language = language;
        this.starterCode = starterCode;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(language)) {
            throw new ValidateException("Coding lesson language must not be null");
        }
        if (language.isBlank()) {
            throw new ValidateException("Coding lesson language must not be blank");
        }
        if (Objects.isNull(starterCode)) {
            throw new ValidateException("Coding lesson starter code must not be null");
        }
    }
}
