package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@ToString
public class QuizLessonPayload extends BaseValueObject implements LessonPayload {

    private final String introMarkdown;
    private final List<QuizQuestion> questions;

    public QuizLessonPayload(String introMarkdown, List<QuizQuestion> questions) {
        this.introMarkdown = introMarkdown;
        this.questions = Objects.isNull(questions) ? new ArrayList<>() : new ArrayList<>(questions);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(introMarkdown)) {
            throw new ValidateException("Quiz intro markdown must not be null");
        }
        if (introMarkdown.isBlank()) {
            throw new ValidateException("Quiz intro markdown must not be blank");
        }
        if (questions.isEmpty()) {
            throw new ValidateException("Quiz questions must not be empty");
        }
        if (questions.stream().anyMatch(Objects::isNull)) {
            throw new ValidateException("Quiz questions must not contain null items");
        }
    }
}
