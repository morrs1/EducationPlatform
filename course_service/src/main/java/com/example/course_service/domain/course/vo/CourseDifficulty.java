package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.Set;

@ToString
@Getter
public class CourseDifficulty extends BaseValueObject {

    private static final Set<String> ALLOWED_DIFFICULTIES =
            Set.of("beginner", "intermediate", "advanced");

    private final String difficulty;

    public CourseDifficulty(String difficulty) {
        this.difficulty = difficulty;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(difficulty)) {
            throw new ValidateException("Course difficulty must not be null");
        }
        if (difficulty.isBlank()) {
            throw new ValidateException("Course difficulty must not be blank");
        }
        if (!ALLOWED_DIFFICULTIES.contains(difficulty)) {
            throw new ValidateException("Course difficulty must be one of: beginner, intermediate, advanced");
        }
    }
}
