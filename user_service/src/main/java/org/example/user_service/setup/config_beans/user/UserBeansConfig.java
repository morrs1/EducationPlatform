package org.example.user_service.setup.config_beans.user;

import org.example.user_service.application.interactors.mappers.UserViewMapper;
import org.example.user_service.application.interactors.user.add_current_course.AddCurrentCourseInteractor;
import org.example.user_service.application.interactors.user.add_finished_course.AddFinishedCourseInteractor;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoInteractor;
import org.example.user_service.application.interactors.user.create_user.CreateUserInteractor;
import org.example.user_service.application.interactors.user.read_user_by_id.ReadUserByIdInteractor;
import org.example.user_service.application.interactors.user.update_user.ChangePersonalDataUserInteractor;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.application.ports.PhotoStorage;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.services.UserDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserBeansConfig {

    @Bean
    public UserDomainService userDomainService(PasswordHasher passwordHasher) {
        return new UserDomainService(passwordHasher);
    }

    @Bean
    public CreateUserInteractor createUserInteractor(
            TransactionManager transactionManager,
            UserRepo userRepo,
            UserDomainService userDomainService,
            EventBus eventBus
    ) {
        return new CreateUserInteractor(transactionManager, userRepo, userDomainService, eventBus);
    }

    @Bean
    public ReadUserByIdInteractor ReadUserByIdInteractor(
            TransactionManager transactionManager,
            UserRepo userRepo
    ) {
        return new ReadUserByIdInteractor(transactionManager, userRepo, new UserViewMapper());
    }

    @Bean
    public ChangePersonalDataUserInteractor changePersonalDataUserInteractor(
            TransactionManager transactionManager,
            UserRepo userRepo,
            UserDomainService userDomainService
    ) {
        return new ChangePersonalDataUserInteractor(
                userRepo,
                transactionManager,
                userDomainService
        );
    }

    @Bean
    public AddProfilePhotoInteractor addProfilePhotoInteractor(
            PhotoStorage photoStorage,
            TransactionManager transactionManager,
            UserRepo userRepo,
            UserDomainService userDomainService
    ) {
        return new AddProfilePhotoInteractor(photoStorage, transactionManager, userRepo, userDomainService);
    }

    @Bean
    public AddCurrentCourseInteractor addCurrentCourseInteractor(
            TransactionManager transactionManager,
            UserRepo userRepo,
            UserDomainService userDomainService
    ) {
        return new AddCurrentCourseInteractor(transactionManager, userRepo, userDomainService);
    }

    @Bean
    public AddFinishedCourseInteractor addFinishedCourseInteractor(
            TransactionManager transactionManager,
            UserRepo userRepo,
            UserDomainService userDomainService
    ) {
        return new AddFinishedCourseInteractor(transactionManager, userRepo, userDomainService);
    }


}
