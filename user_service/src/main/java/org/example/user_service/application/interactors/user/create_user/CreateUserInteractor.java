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

    public UUID create(CreateUserCommand command) {

        return transactionManager.inTransaction(() -> {
            var user = userService.createUser(
                    command.surname(),
                    command.name(),
                    command.patronymic(),
                    command.userStatus(),
                    command.userEmail(),
                    command.userPassword(),
                    command.userProfilePhotoLink(),
                    command.currentCourses(),
                    command.finishedCourses(),
                    command.certificates()
            );

            if (userRepo.readUserByEmail(user.getEmail().getEmail()).isPresent()) {
                throw new UserAlreadyExistsException(String.format("User with email %s already exists", user.getEmail().getEmail()));
            }

            eventBus.publish(userService.pull_events());
            return userRepo.createUser(user);
        });
    }

}
