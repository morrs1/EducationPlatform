package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@ToString
public class QuizQuestion extends BaseValueObject {

    private final UUID id;
    private final String type;
    private final String text;
    private final List<QuizOption> options;

    public QuizQuestion(UUID id, String type, String text, List<QuizOption> options) {
        this.id = id;
        this.type = type;
        this.text = text;
        this.options = Objects.isNull(options) ? new ArrayList<>() : new ArrayList<>(options);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(id)) {
            throw new ValidateException("Quiz question id must not be null");
        }
        if (Objects.isNull(type)) {
            throw new ValidateException("Quiz question type must not be null");
        }
        if (type.isBlank()) {
            throw new ValidateException("Quiz question type must not be blank");
        }
        if (Objects.isNull(text)) {
            throw new ValidateException("Quiz question text must not be null");
        }
        if (text.isBlank()) {
            throw new ValidateException("Quiz question text must not be blank");
        }
        if (options.isEmpty()) {
            throw new ValidateException("Quiz question options must not be empty");
        }
        if (options.stream().anyMatch(Objects::isNull)) {
            throw new ValidateException("Quiz question options must not contain null items");
        }
        if (options.stream().noneMatch(QuizOption::getIsCorrect)) {
            throw new ValidateException("Quiz question must have at least one correct option");
        }
    }
}
