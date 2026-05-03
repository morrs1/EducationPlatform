package org.example.learning_service.setup.config_beans.transaction;

import jakarta.persistence.EntityManagerFactory;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.infrastructure.adapters.transactions.SpringTransactionManagerAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
public class TransactionalBeansConfig {

    /**
     * Имя бина {@code transactionManager} нужно для Spring Data JPA / @Transactional
     * (по умолчанию ищется именно такой {@link PlatformTransactionManager}).
     */
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    @Bean
    public TransactionTemplate transactionTemplate(PlatformTransactionManager transactionManager) {
        return new TransactionTemplate(transactionManager);
    }

    @Bean
    public TransactionManager applicationTransactionManager(TransactionTemplate transactionTemplate) {
        return new SpringTransactionManagerAdapter(transactionTemplate);
    }
}
