package com.example.course_service.setup.config_beans.lesson;

import com.example.course_service.application.interactors.lesson.add_lesson.AddLessonInteractor;
import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdInteractor;
import com.example.course_service.application.interactors.mappers.LessonViewMapper;
import com.example.course_service.application.ports.AssetRepo;
import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import com.example.course_service.domain.lesson.services.LessonDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LessonConfig {
    @Bean
    public AddLessonInteractor addLessonInteractor(
            LessonRepo lessonRepo,
            CourseRepo courseRepo,
            TransactionManager transactionManager
    ) {
        return new AddLessonInteractor(
                lessonRepo,
                courseRepo,
                transactionManager,
                new LessonDomainService(),
                new CourseDomainService()
        );
    }

    @Bean
    public ReadLessonByIdInteractor readLessonByIdInteractor(
            LessonRepo lessonRepo,
            TransactionManager transactionManager,
            AssetRepo assetRepo
    ) {
        return new ReadLessonByIdInteractor(lessonRepo, transactionManager, new LessonViewMapper(), assetRepo);
    }
}
