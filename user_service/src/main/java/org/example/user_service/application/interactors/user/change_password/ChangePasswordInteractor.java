package org.example.user_service.application.interactors.user.change_password;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class ChangePasswordInteractor {

    private final UserRepo userRepo;
    private final TransactionManager transactionManager;
    private final UserDomainService domainService;
    private final PasswordHasher passwordHasher;

    public void change(ChangePasswordCommand command) {
        transactionManager.inTransaction(() -> {
            var user = userRepo.readById(command.id())
                    .orElseThrow(() -> new UserNotFoundException("User was not found"));
            if (!Boolean.TRUE.equals(
                    passwordHasher.verify(command.oldPassword(), user.getPassword().getPassword()))) {
                throw new InvalidCredentialsException("Invalid current password");
            }
            domainService.updatePassword(user, command.newPassword());
            userRepo.update(user);
        });
    }
}
