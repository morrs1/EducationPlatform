package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;

import lombok.Getter;
import lombok.ToString;

/**
 * Maps to {@code course.is_preview}: {@code true} = published (выложенный), {@code false} = draft.
 */
@ToString
@Getter
public class CourseIsPreview extends BaseValueObject {

    private final boolean preview;

    public CourseIsPreview(Boolean preview) {
        this.preview = preview;
    }

    @Override
    public void validate() {
    }
}
