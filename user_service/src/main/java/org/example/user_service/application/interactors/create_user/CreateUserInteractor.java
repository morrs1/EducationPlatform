package org.example.user_service.application.interactors.create_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;

import java.util.UUID;

@RequiredArgsConstructor
public class CreateUserInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;

    public UUID create(CreateUserCommand command) {
        return transactionManager.inTransaction(() -> userRepo.createUser(command));
    }

}
