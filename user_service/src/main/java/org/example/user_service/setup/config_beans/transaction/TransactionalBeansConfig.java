package org.example.user_service.setup.config_beans.transaction;

import jakarta.persistence.EntityManagerFactory;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.infrastructure.transactions.SpringTransactionManagerAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
public class TransactionalBeansConfig {

    // Build TransactionTemplate on top of JPA TM so one application-level transaction
    // can safely drive JPA/Hibernate work and plain JdbcTemplate calls on the same DataSource.
    @Bean
    public PlatformTransactionManager platformTransactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    @Bean
    public TransactionTemplate transactionTemplate(PlatformTransactionManager platformTransactionManager) {
        return new TransactionTemplate(platformTransactionManager);
    }

    @Bean
    public TransactionManager applicationTransactionManager(TransactionTemplate transactionTemplate) {
        return new SpringTransactionManagerAdapter(transactionTemplate);
    }
}
