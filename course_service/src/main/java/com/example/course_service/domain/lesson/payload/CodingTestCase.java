package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.UUID;

@Getter
@ToString
public class CodingTestCase extends BaseValueObject {

    private final UUID id;
    private final Boolean isPublic;
    private final String input;
    private final String expectedOutput;

    public CodingTestCase(UUID id, Boolean isPublic, String input, String expectedOutput) {
        this.id = id;
        this.isPublic = isPublic;
        this.input = input;
        this.expectedOutput = expectedOutput;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(id)) {
            throw new ValidateException("Coding test case id must not be null");
        }
        if (Objects.isNull(isPublic)) {
            throw new ValidateException("Coding test case visibility flag must not be null");
        }
        if (Objects.isNull(input)) {
            throw new ValidateException("Coding test case input must not be null");
        }
        if (Objects.isNull(expectedOutput)) {
            throw new ValidateException("Coding test case expected output must not be null");
        }
    }
}
