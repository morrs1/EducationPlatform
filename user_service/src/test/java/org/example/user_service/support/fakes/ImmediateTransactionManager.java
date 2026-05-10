package org.example.user_service.support.fakes;

import java.util.function.Supplier;

import org.example.user_service.application.ports.TransactionManager;

/**
 * {@link TransactionManager} that runs the action immediately on the caller thread.
 * No real transaction, no rollback semantics — appropriate for unit tests of
 * interactors that orchestrate work through the port.
 */
public final class ImmediateTransactionManager implements TransactionManager {

    @Override
    public void inTransaction(Runnable action) {
        action.run();
    }

    @Override
    public <T> T inTransaction(Supplier<T> action) {
        return action.get();
    }
}
