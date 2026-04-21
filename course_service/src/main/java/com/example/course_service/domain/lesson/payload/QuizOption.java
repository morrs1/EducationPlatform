package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.UUID;

@Getter
@ToString
public class QuizOption extends BaseValueObject {

    private final UUID id;
    private final String text;
    private final Boolean isCorrect;

    public QuizOption(UUID id, String text, Boolean isCorrect) {
        this.id = id;
        this.text = text;
        this.isCorrect = isCorrect;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(id)) {
            throw new ValidateException("Quiz option id must not be null");
        }
        if (Objects.isNull(text)) {
            throw new ValidateException("Quiz option text must not be null");
        }
        if (text.isBlank()) {
            throw new ValidateException("Quiz option text must not be blank");
        }
        if (Objects.isNull(isCorrect)) {
            throw new ValidateException("Quiz option correctness flag must not be null");
        }
    }
}
