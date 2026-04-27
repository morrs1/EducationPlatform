package com.example.course_service.domain.module;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.module.vo.ModuleDescription;
import com.example.course_service.domain.module.vo.ModuleEstimatedMinutes;
import com.example.course_service.domain.module.vo.ModulePosition;
import com.example.course_service.domain.module.vo.ModuleTitle;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
public class Module extends BaseEntity {

    private UUID courseId;
    private ModuleTitle title;
    private ModuleDescription description;
    private ModulePosition position;
    private ModuleEstimatedMinutes estimatedMinutes;
    private List<LessonPreview> lessons;

    public Module(
            UUID id,
            UUID courseId,
            ModuleTitle title,
            ModuleDescription description,
            ModulePosition position,
            ModuleEstimatedMinutes estimatedMinutes,
            List<LessonPreview> lessons
    ) {
        super(id);
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.position = position;
        this.estimatedMinutes = estimatedMinutes;
        this.lessons = Objects.isNull(lessons) ? new ArrayList<>() : new ArrayList<>(lessons);
    }
}
