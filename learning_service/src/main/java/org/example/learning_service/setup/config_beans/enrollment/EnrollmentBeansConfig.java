package org.example.learning_service.setup.config_beans.enrollment;

import org.example.learning_service.application.interactors.enrollment.complete_course.CompleteCourseInteractor;
import org.example.learning_service.application.interactors.enrollment.complete_lesson.CompleteLessonInteractor;
import org.example.learning_service.application.interactors.enrollment.enroll_user_in_course.EnrollUserInCourseInteractor;
import org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course.ReadCompletedLessonsForCourseInteractor;
import org.example.learning_service.application.interactors.enrollment.user_course_lists.ReadCompletedCoursesByUserInteractor;
import org.example.learning_service.application.interactors.enrollment.user_course_lists.ReadIncompleteCoursesByUserInteractor;
import org.example.learning_service.application.interactors.mappers.EnrollmentViewMapper;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.activity.services.StudyActivityDomainService;
import org.example.learning_service.domain.enrollment.services.EnrollmentDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnrollmentBeansConfig {

    @Bean
    public EnrollmentDomainService enrollmentDomainService() {
        return new EnrollmentDomainService();
    }

    @Bean
    public CompleteCourseInteractor completeCourseInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            EnrollmentDomainService enrollmentDomainService
    ) {
        return new CompleteCourseInteractor(transactionManager, enrollmentRepo, enrollmentDomainService);
    }

    @Bean
    public CompleteLessonInteractor completeLessonInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            StudyActivityRepo studyActivityRepo,
            StudyActivityDomainService studyActivityDomainService
    ) {
        return new CompleteLessonInteractor(
                transactionManager,
                enrollmentRepo,
                studyActivityRepo,
                studyActivityDomainService
        );
    }

    @Bean
    public EnrollUserInCourseInteractor enrollUserInCourseInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo
    ) {
        return new EnrollUserInCourseInteractor(transactionManager, enrollmentRepo);
    }

    @Bean
    public ReadCompletedLessonsForCourseInteractor readCompletedLessonsForCourseInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            EnrollmentViewMapper enrollmentViewMapper
    ) {
        return new ReadCompletedLessonsForCourseInteractor(
                transactionManager,
                enrollmentRepo,
                enrollmentViewMapper
        );
    }

    @Bean
    public ReadCompletedCoursesByUserInteractor readCompletedCoursesByUserInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            EnrollmentViewMapper enrollmentViewMapper
    ) {
        return new ReadCompletedCoursesByUserInteractor(
                transactionManager,
                enrollmentRepo,
                enrollmentViewMapper
        );
    }

    @Bean
    public ReadIncompleteCoursesByUserInteractor readIncompleteCoursesByUserInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            EnrollmentViewMapper enrollmentViewMapper
    ) {
        return new ReadIncompleteCoursesByUserInteractor(
                transactionManager,
                enrollmentRepo,
                enrollmentViewMapper
        );
    }
}
