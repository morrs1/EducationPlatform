package org.example.learning_service.setup.config_beans.activity;

import org.example.learning_service.application.interactors.activity.read_activity_year.ReadStudyActivityYearInteractor;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.activity.services.StudyActivityDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StudyActivityBeansConfig {

    @Bean
    public StudyActivityDomainService studyActivityDomainService() {
        return new StudyActivityDomainService();
    }

    @Bean
    public ReadStudyActivityYearInteractor readStudyActivityYearInteractor(
            TransactionManager transactionManager,
            StudyActivityRepo studyActivityRepo
    ) {
        return new ReadStudyActivityYearInteractor(transactionManager, studyActivityRepo);
    }
}
