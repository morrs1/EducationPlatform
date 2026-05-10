package org.example.user_service.application.interactors.user.assign_role;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class AssignUserRoleInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userDomainService;

    public void assignAuthor(AssignUserRoleCommand command) {
        transactionManager.inTransaction(() -> {
            User user = readUser(command);
            userDomainService.assignAuthorRole(user);
            userRepo.update(user);
        });
    }

    public void assignAdmin(AssignUserRoleCommand command) {
        transactionManager.inTransaction(() -> {
            User user = readUser(command);
            userDomainService.assignAdminRole(user);
            userRepo.update(user);
        });
    }

    private User readUser(AssignUserRoleCommand command) {
        return userRepo.readById(command.userId())
                .orElseThrow(() -> new UserNotFoundException("User was not found"));
    }
}
