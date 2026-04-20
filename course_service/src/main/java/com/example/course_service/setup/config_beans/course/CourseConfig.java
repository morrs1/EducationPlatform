package com.example.course_service.setup.config_beans.course;

import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdInteractor;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import com.example.course_service.infrasructure.adapters.persistence.HibernateLessonRepo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CourseConfig {
//TODO убрать lessonRepo
    @Bean
    public ReadCourseByIdInteractor readCourseByIdInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager, HibernateLessonRepo lessonRepo) {
        return new ReadCourseByIdInteractor(hibernateCourseRepo, transactionManager, new CourseViewMapper(), lessonRepo);
    }


}
