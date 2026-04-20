package com.example.course_service.domain.lesson_preview.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class LessonPreviewIsPreview extends BaseValueObject {

    private final Boolean preview;

    public LessonPreviewIsPreview(Boolean preview) {
        this.preview = preview;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(preview)) {
            throw new ValidateException("Lesson preview flag must not be null");
        }
    }
}
