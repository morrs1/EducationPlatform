package org.example.user_service.application.interactors.user.create_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserAlreadyExistsException;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;

import java.util.UUID;

@RequiredArgsConstructor
public class CreateUserInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userService;
    private final EventBus eventBus;
//TODO проверить работу транзакций
    public UUID add(CreateUserCommand command) {

        return transactionManager.inTransaction(() -> {
            if (userRepo.readByEmail(command.userEmail()).isPresent()) {
                throw new UserAlreadyExistsException(
                        String.format("User with email %s already exists", command.userEmail())
                );
            }

            var user = userService.add(
                    command.surname(),
                    command.name(),
                    command.patronymic(),
                    command.userStatus(),
                    command.userEmail(),
                    command.userPassword(),
                    command.userProfilePhotoLink()
            );

            eventBus.publish(userService.pull_events());
            return userRepo.add(user);
        });
    }

}
