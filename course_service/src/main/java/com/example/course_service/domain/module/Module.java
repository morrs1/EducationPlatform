package com.example.course_service.domain.module;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.module.vo.ModuleDescription;
import com.example.course_service.domain.module.vo.ModuleEstimatedMinutes;
import com.example.course_service.domain.module.vo.ModuleLessons;
import com.example.course_service.domain.module.vo.ModulePosition;
import com.example.course_service.domain.module.vo.ModuleTitle;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Module extends BaseEntity {

    private ModuleTitle title;
    private ModuleDescription description;
    private ModulePosition position;
    private ModuleEstimatedMinutes estimatedMinutes;
    private ModuleLessons lessons;

    public Module(
            UUID id,
            ModuleTitle title,
            ModuleDescription description,
            ModulePosition position,
            ModuleEstimatedMinutes estimatedMinutes,
            ModuleLessons lessons
    ) {
        super(id);
        this.title = title;
        this.description = description;
        this.position = position;
        this.estimatedMinutes = estimatedMinutes;
        this.lessons = lessons;
    }
}
