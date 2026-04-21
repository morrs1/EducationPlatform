package com.example.course_service.setup.config_beans.lesson;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdInteractor;
import com.example.course_service.application.interactors.mappers.LessonViewMapper;
import com.example.course_service.application.ports.LessonRepo;
import com.example.course_service.application.ports.TransactionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LessonConfig {
    @Bean
    public ReadLessonByIdInteractor readLessonByIdInteractor(LessonRepo lessonRepo, TransactionManager transactionManager) {
        return new ReadLessonByIdInteractor(lessonRepo, transactionManager, new LessonViewMapper());
    }
}
