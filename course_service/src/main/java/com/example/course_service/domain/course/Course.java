package com.example.course_service.domain.course;

import com.example.course_service.domain.base.BaseEntity;
import com.example.course_service.domain.course.vo.*;
import com.example.course_service.domain.module.Module;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
//TODO убрать noArgsConstructor
public class Course extends BaseEntity {

    private UUID authorId;
    private CourseTitle title;
    private CourseShortDescription shortDescription;
    private CourseDescription description;
    private CourseDifficulty difficulty;
    private CourseLanguageCode languageCode;
    private CourseEstimatedMinutes estimatedMinutes;
    private List<Module> structure;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TagId tagId;
    private TagName tagName;

    public Course(
            UUID id,
            UUID authorId,
            CourseTitle title,
            CourseShortDescription shortDescription,
            CourseDescription description,
            CourseDifficulty difficulty,
            CourseLanguageCode languageCode,
            CourseEstimatedMinutes estimatedMinutes,
            List<Module> structure,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            TagId tagId,
            TagName tagName
    ) {
        super(id);
        this.authorId = authorId;
        this.title = title;
        this.shortDescription = shortDescription;
        this.description = description;
        this.difficulty = difficulty;
        this.languageCode = languageCode;
        this.estimatedMinutes = estimatedMinutes;
        this.structure = structure;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tagId = tagId;
        this.tagName = tagName;
    }
}
