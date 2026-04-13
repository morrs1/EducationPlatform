package org.example.user_service.application.interactors.user.update_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class ChangePersonalDataUserInteractor {

    private final UserRepo repo;
    private final TransactionManager transactionManager;
    private final UserDomainService domainService;

    public void updateName(ChangeUserNameCommand changeUserNameCommand) {
        transactionManager.inTransaction(() -> {
            var user = repo.readById(changeUserNameCommand.id()).orElseThrow(() -> new UserNotFoundException("User was not found"));
            domainService.updateName(user, changeUserNameCommand.newName());
            repo.update(user);
        });

    }

    public void updateSurname(ChangeUserSurnameCommand changeUserSurnameCommand) {
        transactionManager.inTransaction(() -> {
            var user = repo.readById(changeUserSurnameCommand.id()).orElseThrow(() -> new UserNotFoundException("User was not found"));
            domainService.updateSurname(user, changeUserSurnameCommand.newSurname());
            repo.update(user);
        });
    }

    public void updatePatronymic(ChangeUserPatronymicCommand changeUserPatronymicCommand) {
        transactionManager.inTransaction(() -> {
            var user = repo.readById(changeUserPatronymicCommand.id()).orElseThrow(() -> new UserNotFoundException("User was not found"));
            domainService.updatePatronymic(user, changeUserPatronymicCommand.newPatronymic());
            repo.update(user);
        });
    }

    public void updateStatus(ChangeUserStatusCommand changeUserStatusCommand) {
        transactionManager.inTransaction(() -> {
            var user = repo.readById(changeUserStatusCommand.id()).orElseThrow(() -> new UserNotFoundException("User was not found"));
            domainService.updateStatus(user, changeUserStatusCommand.newStatus());
            repo.update(user);
        });
    }

}
