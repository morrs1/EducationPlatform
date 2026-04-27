package com.example.course_service.presentation.http.v1.mappers;

import com.example.course_service.application.interactors.course.read_course_by_id.views.LessonPreviewView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.ModuleView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.ReadCourseByIdView;
import com.example.course_service.application.interactors.course.read_course_by_id.views.TagView;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.LessonPreviewResponse;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.ModuleResponse;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.ReadCourseByIdResponse;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.TagResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class CourseMapperQuery {

    public ReadCourseByIdResponse toReadCourseByIdResponse(ReadCourseByIdView readCourseByIdView) {
        return new ReadCourseByIdResponse(
                readCourseByIdView.authorId(),
                readCourseByIdView.title(),
                readCourseByIdView.shortDescription(),
                readCourseByIdView.description(),
                readCourseByIdView.difficulty(),
                readCourseByIdView.languageCode(),
                readCourseByIdView.estimatedMinutes(),
                mapModules(readCourseByIdView.structure()),
                readCourseByIdView.createdAt(),
                readCourseByIdView.updatedAt(),
                mapTags(readCourseByIdView.tags())
        );
    }

    private List<ModuleResponse> mapModules(List<ModuleView> modules) {
        if (Objects.isNull(modules)) {
            return List.of();
        }

        return modules.stream()
                .map(this::mapModule)
                .toList();
    }

    private ModuleResponse mapModule(ModuleView module) {
        return new ModuleResponse(
                module.id(),
                module.courseId(),
                module.title(),
                module.description(),
                module.position(),
                module.estimatedMinutes(),
                mapLessonPreviews(module.lessons())
        );
    }

    private List<LessonPreviewResponse> mapLessonPreviews(List<LessonPreviewView> lessonPreviews) {
        if (Objects.isNull(lessonPreviews)) {
            return List.of();
        }

        return lessonPreviews.stream()
                .map(this::mapLessonPreview)
                .toList();
    }

    private LessonPreviewResponse mapLessonPreview(LessonPreviewView lessonPreview) {
        return new LessonPreviewResponse(
                lessonPreview.id(),
                lessonPreview.type(),
                lessonPreview.title(),
                lessonPreview.position(),
                lessonPreview.estimatedMinutes(),
                lessonPreview.isPreview()
        );
    }

    private List<TagResponse> mapTags(List<TagView> tags) {
        if (Objects.isNull(tags)) {
            return List.of();
        }

        return tags.stream()
                .map(this::mapTag)
                .toList();
    }

    private TagResponse mapTag(TagView tag) {
        return new TagResponse(
                tag.id(),
                tag.name()
        );
    }
}
