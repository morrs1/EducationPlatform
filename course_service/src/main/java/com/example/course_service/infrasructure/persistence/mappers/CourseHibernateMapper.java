package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.course.Course;
import com.example.course_service.domain.course.vo.CourseDescription;
import com.example.course_service.domain.course.vo.CourseDifficulty;
import com.example.course_service.domain.course.vo.CourseEstimatedMinutes;
import com.example.course_service.domain.course.vo.CourseLanguageCode;
import com.example.course_service.domain.course.vo.CourseShortDescription;
import com.example.course_service.domain.course.vo.CourseTitle;
import com.example.course_service.domain.course.vo.TagName;
import com.example.course_service.domain.lesson_preview.LessonPreview;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewEstimatedMinutes;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewIsPreview;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewPosition;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewTitle;
import com.example.course_service.domain.lesson_preview.vo.LessonPreviewType;
import com.example.course_service.domain.module.Module;
import com.example.course_service.domain.module.vo.ModuleDescription;
import com.example.course_service.domain.module.vo.ModuleEstimatedMinutes;
import com.example.course_service.domain.module.vo.ModulePosition;
import com.example.course_service.domain.module.vo.ModuleTitle;
import com.example.course_service.domain.tag.Tag;
import com.example.course_service.infrasructure.persistence.models.course.HibernateCourse;
import com.example.course_service.infrasructure.persistence.models.course.HibernateTag;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Component
public class CourseHibernateMapper {

    public HibernateCourse toHibernateCourse(Course course) {
        var hibernateCourse = new HibernateCourse();
        hibernateCourse.setId(course.getId());
        hibernateCourse.setAuthorId(course.getAuthorId());
        hibernateCourse.setTitle(Objects.isNull(course.getTitle()) ? null : course.getTitle().getTitle());
        hibernateCourse.setShortDescription(Objects.isNull(course.getShortDescription()) ? null : course.getShortDescription().getShortDescription());
        hibernateCourse.setDescription(Objects.isNull(course.getDescription()) ? null : course.getDescription().getDescription());
        hibernateCourse.setDifficulty(Objects.isNull(course.getDifficulty()) ? null : course.getDifficulty().getDifficulty());
        hibernateCourse.setLanguageCode(Objects.isNull(course.getLanguageCode()) ? null : course.getLanguageCode().getLanguageCode());
        hibernateCourse.setEstimatedMinutes(Objects.isNull(course.getEstimatedMinutes()) ? null : course.getEstimatedMinutes().getEstimatedMinutes());
        hibernateCourse.setStructure(new HibernateCourse.CourseStructureJson(mapModuleJsons(course.getStructure())));
        hibernateCourse.setCreatedAt(course.getCreatedAt());
        hibernateCourse.setUpdatedAt(course.getUpdatedAt());
        hibernateCourse.setTags(mapHibernateTags(course.getTags()));
        return hibernateCourse;
    }

    public Course toDomainCourse(HibernateCourse hibernateCourse) {
        return new Course(
                hibernateCourse.getId(),
                hibernateCourse.getAuthorId(),
                new CourseTitle(hibernateCourse.getTitle()),
                new CourseShortDescription(hibernateCourse.getShortDescription()),
                new CourseDescription(hibernateCourse.getDescription()),
                new CourseDifficulty(hibernateCourse.getDifficulty()),
                new CourseLanguageCode(hibernateCourse.getLanguageCode()),
                new CourseEstimatedMinutes(hibernateCourse.getEstimatedMinutes()),
                mapModules(hibernateCourse.getStructure()),
                hibernateCourse.getCreatedAt(),
                hibernateCourse.getUpdatedAt(),
                mapTags(hibernateCourse.getTags())
        );
    }

    private Set<HibernateTag> mapHibernateTags(List<Tag> tags) {
        if (Objects.isNull(tags)) {
            return new LinkedHashSet<>();
        }

        return tags.stream()
                .map(this::mapHibernateTag)
                .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);
    }

    private HibernateTag mapHibernateTag(Tag tag) {
        var hibernateTag = new HibernateTag();
        hibernateTag.setId(tag.getId());
        hibernateTag.setName(Objects.isNull(tag.getName()) ? null : tag.getName().getName());
        return hibernateTag;
    }

    private List<Tag> mapTags(Set<HibernateTag> tags) {
        if (Objects.isNull(tags)) {
            return new ArrayList<>();
        }

        return tags.stream()
                .map(this::mapTag)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private Tag mapTag(HibernateTag hibernateTag) {
        return new Tag(
                hibernateTag.getId(),
                new TagName(hibernateTag.getName())
        );
    }

    private List<HibernateCourse.ModuleJson> mapModuleJsons(List<Module> modules) {
        if (Objects.isNull(modules)) {
            return new ArrayList<>();
        }

        return modules.stream()
                .map(this::mapModuleJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private HibernateCourse.ModuleJson mapModuleJson(Module module) {
        return new HibernateCourse.ModuleJson(
                module.getId(),
                module.getCourseId(),
                Objects.isNull(module.getTitle()) ? null : module.getTitle().getTitle(),
                Objects.isNull(module.getDescription()) ? null : module.getDescription().getDescription(),
                Objects.isNull(module.getPosition()) ? null : module.getPosition().getPosition(),
                Objects.isNull(module.getEstimatedMinutes()) ? null : module.getEstimatedMinutes().getEstimatedMinutes(),
                mapLessonPreviewJsons(module.getLessons())
        );
    }

    private List<HibernateCourse.LessonPreviewJson> mapLessonPreviewJsons(List<LessonPreview> lessonPreviews) {
        if (Objects.isNull(lessonPreviews)) {
            return new ArrayList<>();
        }

        return lessonPreviews.stream()
                .map(this::mapLessonPreviewJson)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private HibernateCourse.LessonPreviewJson mapLessonPreviewJson(LessonPreview lessonPreview) {
        return new HibernateCourse.LessonPreviewJson(
                lessonPreview.getId(),
                Objects.isNull(lessonPreview.getType()) ? null : lessonPreview.getType().getLessonType(),
                Objects.isNull(lessonPreview.getTitle()) ? null : lessonPreview.getTitle().getTitle(),
                Objects.isNull(lessonPreview.getPosition()) ? null : lessonPreview.getPosition().getPosition(),
                Objects.isNull(lessonPreview.getEstimatedMinutes()) ? null : lessonPreview.getEstimatedMinutes().getEstimatedMinutes(),
                Objects.isNull(lessonPreview.getIsPreview()) ? null : lessonPreview.getIsPreview().getPreview()
        );
    }

    private List<Module> mapModules(HibernateCourse.CourseStructureJson structureJson) {
        if (Objects.isNull(structureJson) || Objects.isNull(structureJson.modules())) {
            return new ArrayList<>();
        }

        return structureJson.modules()
                .stream()
                .map(this::mapModule)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private Module mapModule(HibernateCourse.ModuleJson moduleJson) {
        return new Module(
                moduleJson.id(),
                moduleJson.courseId(),
                new ModuleTitle(moduleJson.title()),
                new ModuleDescription(moduleJson.description()),
                new ModulePosition(moduleJson.position()),
                new ModuleEstimatedMinutes(moduleJson.estimatedMinutes()),
                mapLessonPreviews(moduleJson.lessons())
        );
    }

    private List<LessonPreview> mapLessonPreviews(List<HibernateCourse.LessonPreviewJson> lessonPreviewJsons) {
        if (Objects.isNull(lessonPreviewJsons)) {
            return new ArrayList<>();
        }

        return lessonPreviewJsons.stream()
                .map(this::mapLessonPreview)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private LessonPreview mapLessonPreview(HibernateCourse.LessonPreviewJson lessonPreviewJson) {
        return new LessonPreview(
                lessonPreviewJson.id(),
                new LessonPreviewType(lessonPreviewJson.type()),
                new LessonPreviewTitle(lessonPreviewJson.title()),
                new LessonPreviewPosition(lessonPreviewJson.position()),
                new LessonPreviewEstimatedMinutes(lessonPreviewJson.estimatedMinutes()),
                new LessonPreviewIsPreview(lessonPreviewJson.isPreview())
        );
    }
}
