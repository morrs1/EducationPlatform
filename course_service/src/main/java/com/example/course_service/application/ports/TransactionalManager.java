package com.example.course_service.application.ports;

import java.util.function.Supplier;

public interface TransactionalManager {

    void inTransaction(Runnable action);

    <T> T inTransaction(Supplier<T> action);
}
