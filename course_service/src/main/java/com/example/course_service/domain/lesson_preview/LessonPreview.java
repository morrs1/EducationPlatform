package com.example.course_service.domain.lesson_preview;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewEstimatedMinutes;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewIsPreview;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewPosition;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewTitle;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class LessonPreview extends BaseEntity {

    private LessonPreviewType type;
    private LessonPreviewTitle title;
    private LessonPreviewPosition position;
    private LessonPreviewEstimatedMinutes estimatedMinutes;
    private LessonPreviewIsPreview isPreview;

    public LessonPreview(
            UUID id,
            LessonPreviewType type,
            LessonPreviewTitle title,
            LessonPreviewPosition position,
            LessonPreviewEstimatedMinutes estimatedMinutes,
            LessonPreviewIsPreview isPreview
    ) {
        super(id);
        this.type = type;
        this.title = title;
        this.position = position;
        this.estimatedMinutes = estimatedMinutes;
        this.isPreview = isPreview;
    }
}
