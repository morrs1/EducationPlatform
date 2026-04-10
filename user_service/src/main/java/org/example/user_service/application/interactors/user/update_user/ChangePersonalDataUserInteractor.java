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

    public void changeUserName(ChangeUserNameCommand changeUserNameCommand) {
        transactionManager.inTransaction(() -> {
            var user = repo.readUserById(changeUserNameCommand.id()).orElseThrow(() -> new UserNotFoundException("User was not found"));
            domainService.changeName(user, changeUserNameCommand.newName());
            repo.update(user);
        });

    }

}
