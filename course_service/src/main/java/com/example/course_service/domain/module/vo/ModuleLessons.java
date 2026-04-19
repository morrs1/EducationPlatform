package com.example.course_service.domain.module.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import lombok.Getter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@ToString
@Getter
public class ModuleLessons extends BaseValueObject {

    private final List<LessonPreview> lessons;

    public ModuleLessons(List<LessonPreview> lessons) {
        this.lessons = Objects.isNull(lessons) ? null : new ArrayList<>(lessons);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(lessons)) {
            throw new ValidateException("Module lessons must not be null");
        }
        if (lessons.stream().anyMatch(Objects::isNull)) {
            throw new ValidateException("Module lessons must not contain null elements");
        }
    }
}
