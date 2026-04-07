package org.example.user_service.setup.config_beans.user;

import org.example.user_service.application.interactors.create_user.CreateUserInteractor;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.services.UserDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserConfig {

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


}
