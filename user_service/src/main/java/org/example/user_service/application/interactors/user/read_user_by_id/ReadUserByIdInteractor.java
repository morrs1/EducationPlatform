package org.example.user_service.application.interactors.user.read_user_by_id;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.interactors.mappers.UserViewMapper;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadUserByIdInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserViewMapper mapper;

    public ReadUserByIdView readUserById(UUID id) {
        var user = transactionManager.inTransaction(() -> userRepo.readUserById(id));
        if (user.isEmpty()) throw new UserNotFoundException("User was not found");
        return mapper.toReadUserByIdView(user.get());
    }

}
