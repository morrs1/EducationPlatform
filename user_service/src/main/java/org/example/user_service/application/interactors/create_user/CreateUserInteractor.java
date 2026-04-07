package org.example.user_service.application.interactors.create_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.base.BaseDomainEvent;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.domain.user.vo.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class CreateUserInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userService;
    private final EventBus eventBus;

    public UUID create(CreateUserCommand command) {
        //TODO сделать так, чтобы передавались сырые данные в фабричный метод
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
            System.out.println(((CreateUserDomainEvent) userService.getEvents().getFirst()).getUserEmail());
            eventBus.publish(userService.pull_events());
            //TODO передавать пользователя, а не команду
            return userRepo.createUser(user);
        });
    }

}
