package com.example.course_service.infrasructure.persistence.mappers;

import com.example.course_service.domain.lesson.Lesson;
import com.example.course_service.domain.lesson.vo.LessonTitle;
import com.example.course_service.domain.lesson.vo.LessonType;
import com.example.course_service.infrasructure.persistence.models.lesson.HibernateLesson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class LessonHibernateMapper {

    private final JacksonLessonPayloadMapper lessonPayloadMapper;

    public HibernateLesson toHibernateLesson(Lesson lesson) {
        var hibernateLesson = new HibernateLesson();
        hibernateLesson.setId(lesson.getId());
        hibernateLesson.setCourseId(lesson.getCourseId());
        hibernateLesson.setLessonType(Objects.isNull(lesson.getType()) ? null : lesson.getType().getLessonType());
        hibernateLesson.setTitle(Objects.isNull(lesson.getTitle()) ? null : lesson.getTitle().getTitle());
        hibernateLesson.setContent(lessonPayloadMapper.toJson(lesson.getContent()));
        hibernateLesson.setCreatedAt(lesson.getCreatedAt());
        hibernateLesson.setUpdatedAt(lesson.getUpdatedAt());
        return hibernateLesson;
    }

    public Lesson toDomainLesson(HibernateLesson hibernateLesson) {
        return new Lesson(
                hibernateLesson.getId(),
                hibernateLesson.getCourseId(),
                new LessonType(hibernateLesson.getLessonType()),
                new LessonTitle(hibernateLesson.getTitle()),
                lessonPayloadMapper.fromJson(hibernateLesson.getLessonType(), hibernateLesson.getContent()),
                hibernateLesson.getCreatedAt(),
                hibernateLesson.getUpdatedAt()
        );
    }
}
