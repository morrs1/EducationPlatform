package org.example.user_service.application.interactors.create_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.domain.user.vo.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class CreateUserInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userService;
    //TODO добавить ивент бас через реализацию от спринга

    public UUID create(CreateUserCommand command) {
        return transactionManager.inTransaction(() -> {
            userService.createUser(
                    new UserSurname(command.surname()),
                    new UserName(command.name()),
                    new UserPatronymic(command.patronymic()),
                    new UserStatus(command.userStatus()),
                    new UserEmail(command.userEmail()),
                    new UserPassword(command.userPassword()),
                    new UserProfilePhotoLink(command.userProfilePhotoLink()),
                    command.currentCourses().stream().map(UserCurrentCourse::new).toList(),
                    command.finishedCourses().stream().map(UserFinishedCourse::new).toList(),
                    command.certificates().stream().map(UserCertificate::new).toList()
            );
            //TODO передавать пользователя, а не команду
            return userRepo.createUser(command);
        });
    }

}
