package org.example.user_service.setup.config_beans.user;

import org.example.user_service.application.interactors.create_user.CreateUserInteractor;
import org.example.user_service.application.ports.TransactionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CreateUserConfig {

    @Bean
    public CreateUserInteractor createUserInteractor(TransactionManager transactionManager) {
        return new CreateUserInteractor(transactionManager);
    }
}
