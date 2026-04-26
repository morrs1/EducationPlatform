package com.example.course_service.setup.config_beans.course;

import com.example.course_service.application.interactors.course.add_course.AddCourseInteractor;
import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdInteractor;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CourseConfig {
    @Bean
    public ReadCourseByIdInteractor readCourseByIdInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new ReadCourseByIdInteractor(hibernateCourseRepo, transactionManager, new CourseViewMapper());
    }

    @Bean
    public AddCourseInteractor addCourseInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new AddCourseInteractor(transactionManager, hibernateCourseRepo, new CourseDomainService());
    }
}
