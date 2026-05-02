package org.example.learning_service.application.ports;

import java.util.function.Supplier;

public interface TransactionManager {

    void inTransaction(Runnable action);

    <T> T inTransaction(Supplier<T> action);
}
