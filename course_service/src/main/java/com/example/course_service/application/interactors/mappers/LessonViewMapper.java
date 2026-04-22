package com.example.course_service.application.interactors.mappers;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdView;
import com.example.course_service.domain.asset.Asset;
import com.example.course_service.domain.lesson.Lesson;

import java.util.List;

public class LessonViewMapper {

    public ReadLessonByIdView toReadLessonByIdView(Lesson lesson, List<Asset> assets) {
        return new ReadLessonByIdView(
                lesson.getCourseId(),
                lesson.getType().getLessonType(),
                lesson.getTitle().getTitle(),
                lesson.getContent(),
                assets,
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }
}
