package org.example.user_service.infrastructure.transactions;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.TransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.function.Supplier;

@RequiredArgsConstructor
public class SpringTransactionManagerAdapter implements TransactionManager {

    private final TransactionTemplate transactionTemplate;

    @Override
    public void inTransaction(Runnable action) {
        transactionTemplate.executeWithoutResult(status -> action.run());
    }

    @Override
    public <T> T inTransaction(Supplier<T> action) {
        return transactionTemplate.execute(status -> action.get());
    }
}
