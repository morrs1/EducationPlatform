package com.example.course_service.application.interactors.mappers;

import com.example.course_service.application.interactors.course.read_course_by_id.views.LessonPreviewView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.ModuleView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.ReadCourseByIdView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.TagView;
import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.module.Module;
import com.example.course_service.domain.tag.Tag;

import java.util.List;
import java.util.Objects;

public class CourseViewMapper {

    public ReadCourseByIdView toReadCourseByIdView(Course course) {
        return new ReadCourseByIdView(
                course.getAuthorId(),
                course.getTitle().getTitle(),
                course.getShortDescription().getShortDescription(),
                course.getDescription().getDescription(),
                course.getDifficulty().getDifficulty(),
                course.getLanguageCode().getLanguageCode(),
                course.getEstimatedMinutes().getEstimatedMinutes(),
                mapModules(course.getStructure()),
                course.getCreatedAt(),
                course.getUpdatedAt(),
                mapTags(course.getTags())
        );

    }

    private List<ModuleView> mapModules(List<Module> modules) {
        if (Objects.isNull(modules)) {
            return List.of();
        }

        return modules.stream()
                .map(this::mapModule)
                .toList();
    }

    private ModuleView mapModule(Module module) {
        return new ModuleView(
                module.getId(),
                module.getCourseId(),
                Objects.isNull(module.getTitle()) ? null : module.getTitle().getTitle(),
                Objects.isNull(module.getDescription()) ? null : module.getDescription().getDescription(),
                Objects.isNull(module.getPosition()) ? null : module.getPosition().getPosition(),
                Objects.isNull(module.getEstimatedMinutes()) ? null : module.getEstimatedMinutes().getEstimatedMinutes(),
                mapLessonPreviews(module.getLessons())
        );
    }

    private List<LessonPreviewView> mapLessonPreviews(List<LessonPreview> lessonPreviews) {
        if (Objects.isNull(lessonPreviews)) {
            return List.of();
        }

        return lessonPreviews.stream()
                .map(this::mapLessonPreview)
                .toList();
    }

    private LessonPreviewView mapLessonPreview(LessonPreview lessonPreview) {
        return new LessonPreviewView(
                lessonPreview.getId(),
                Objects.isNull(lessonPreview.getType()) ? null : lessonPreview.getType().getLessonType(),
                Objects.isNull(lessonPreview.getTitle()) ? null : lessonPreview.getTitle().getTitle(),
                Objects.isNull(lessonPreview.getPosition()) ? null : lessonPreview.getPosition().getPosition(),
                Objects.isNull(lessonPreview.getEstimatedMinutes()) ? null : lessonPreview.getEstimatedMinutes().getEstimatedMinutes(),
                Objects.isNull(lessonPreview.getIsPreview()) ? null : lessonPreview.getIsPreview().getPreview()
        );
    }

    private List<TagView> mapTags(List<Tag> tags) {
        if (Objects.isNull(tags)) {
            return List.of();
        }

        return tags.stream()
                .map(this::mapTag)
                .toList();
    }

    private TagView mapTag(Tag tag) {
        return new TagView(
                tag.getId(),
                Objects.isNull(tag.getName()) ? null : tag.getName().getName()
        );
    }
}
