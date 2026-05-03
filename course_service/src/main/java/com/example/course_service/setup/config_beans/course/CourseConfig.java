package com.example.course_service.setup.config_beans.course;

import com.example.course_service.application.interactors.course.add_course.AddCourseInteractor;
import com.example.course_service.application.interactors.course.add_module_to_course.AddModuleInteractor;
import com.example.course_service.application.interactors.course.read_all.ReadAllCoursesInteractor;
import com.example.course_service.application.interactors.course.publish_course.PublishCourseInteractor;
import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdInteractor;
import com.example.course_service.application.interactors.course.read_courses_by_author.ReadDraftCoursesByAuthorInteractor;
import com.example.course_service.application.interactors.course.read_courses_by_author.ReadPublishedCoursesByAuthorInteractor;
import com.example.course_service.application.interactors.mappers.CourseViewMapper;
import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.domain.course.services.CourseDomainService;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CourseConfig {
    @Bean
    public ReadAllCoursesInteractor readAllCoursesInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new ReadAllCoursesInteractor(transactionManager, hibernateCourseRepo, new CourseViewMapper());
    }

    @Bean
    public ReadCourseByIdInteractor readCourseByIdInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new ReadCourseByIdInteractor(hibernateCourseRepo, transactionManager, new CourseViewMapper());
    }

    @Bean
    public PublishCourseInteractor publishCourseInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new PublishCourseInteractor(transactionManager, hibernateCourseRepo);
    }

    @Bean
    public ReadPublishedCoursesByAuthorInteractor readPublishedCoursesByAuthorInteractor(
            HibernateCourseRepo hibernateCourseRepo,
            TransactionManager transactionManager
    ) {
        return new ReadPublishedCoursesByAuthorInteractor(transactionManager, hibernateCourseRepo, new CourseViewMapper());
    }

    @Bean
    public ReadDraftCoursesByAuthorInteractor readDraftCoursesByAuthorInteractor(
            HibernateCourseRepo hibernateCourseRepo,
            TransactionManager transactionManager
    ) {
        return new ReadDraftCoursesByAuthorInteractor(transactionManager, hibernateCourseRepo, new CourseViewMapper());
    }

    @Bean
    public AddCourseInteractor addCourseInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new AddCourseInteractor(transactionManager, hibernateCourseRepo, new CourseDomainService());
    }

    @Bean
    public AddModuleInteractor addModuleInteractor(HibernateCourseRepo hibernateCourseRepo, TransactionManager transactionManager) {
        return new AddModuleInteractor(hibernateCourseRepo, transactionManager, new CourseDomainService());
    }
}
