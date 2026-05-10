package com.example.course_service.domain.lesson.payload;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
public class CodingLessonPayload extends BaseValueObject implements LessonPayload {

    private final String taskMarkdown;
    private final String checkerType;
    private final List<CodingLanguageTemplate> languages;
    private final List<CodingTestCase> testCases;

    public CodingLessonPayload(
            String taskMarkdown,
            String checkerType,
            List<CodingLanguageTemplate> languages,
            List<CodingTestCase> testCases
    ) {
        this.taskMarkdown = taskMarkdown;
        this.checkerType = checkerType;
        this.languages = Objects.isNull(languages) ? new ArrayList<>() : new ArrayList<>(languages);
        this.testCases = Objects.isNull(testCases) ? new ArrayList<>() : new ArrayList<>(testCases);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(taskMarkdown)) {
            throw new ValidateException("Coding lesson task markdown must not be null");
        }
        if (taskMarkdown.isBlank()) {
            throw new ValidateException("Coding lesson task markdown must not be blank");
        }
        if (Objects.isNull(checkerType)) {
            throw new ValidateException("Coding lesson checker type must not be null");
        }
        if (checkerType.isBlank()) {
            throw new ValidateException("Coding lesson checker type must not be blank");
        }
        if (languages.isEmpty()) {
            throw new ValidateException("Coding lesson languages must not be empty");
        }
        if (languages.stream().anyMatch(Objects::isNull)) {
            throw new ValidateException("Coding lesson languages must not contain null items");
        }
        if (testCases.isEmpty()) {
            throw new ValidateException("Coding lesson test cases must not be empty");
        }
        if (testCases.stream().anyMatch(Objects::isNull)) {
            throw new ValidateException("Coding lesson test cases must not contain null items");
        }
    }

    @Override
    public String toString() {
        return "taskMarkdown='" + taskMarkdown + '\'' +
                ", checkerType='" + checkerType + '\'' +
                ", languages=" + languages +
                ", testCases=" + testCases;
    }
}
