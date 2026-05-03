package com.example.course_service.domain.course.services;

import com.example.course_service.domain.base.BaseDomainService;
import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.module.Module;
import com.example.course_service.domain.course.vo.*;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewEstimatedMinutes;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewIsPreview;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewPosition;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewTitle;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewType;
import com.example.course_service.domain.module.vo.ModuleDescription;
import com.example.course_service.domain.module.vo.ModuleEstimatedMinutes;
import com.example.course_service.domain.module.vo.ModulePosition;
import com.example.course_service.domain.module.vo.ModuleTitle;
import com.example.course_service.domain.tag.Tag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CourseDomainService extends BaseDomainService {

    public Course create(
            UUID authorId,
            String courseTitle,
            String shortDescription,
            String description,
            String courseDifficulty,
            String languageCode,
            Integer estimatedMinutes,
            List<Tag> tags
    ) {
        return new Course(
                UUID.randomUUID(),
                authorId,
                new CourseTitle(courseTitle),
                new CourseShortDescription(shortDescription),
                new CourseDescription(description),
                new CourseDifficulty(courseDifficulty),
                new CourseLanguageCode(languageCode),
                new CourseEstimatedMinutes(estimatedMinutes),
                new CourseIsPreview(false),
                List.of(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                tags
        );
    }

    public Module createModule(
            UUID courseId,
            String title,
            String description,
            Integer position,
            Integer estimatedMinutes
    ) {
        return new com.example.course_service.domain.module.Module(
                UUID.randomUUID(),
                courseId,
                new ModuleTitle(title),
                new ModuleDescription(description),
                new ModulePosition(position),
                new ModuleEstimatedMinutes(estimatedMinutes),
                List.of()
        );
    }

    public LessonPreview createLessonPreview(
            UUID lessonId,
            String type,
            String title,
            Integer position,
            Integer estimatedMinutes,
            Boolean isPreview
    ) {
        return new LessonPreview(
                lessonId,
                new LessonPreviewType(type),
                new LessonPreviewTitle(title),
                new LessonPreviewPosition(position),
                new LessonPreviewEstimatedMinutes(estimatedMinutes),
                new LessonPreviewIsPreview(isPreview)
        );
    }

}
