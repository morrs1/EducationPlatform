package org.example.user_service.application.interactors.user.change_email;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.exceptions.UserAlreadyExistsException;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.domain.user.vo.UserEmail;

@RequiredArgsConstructor
public class ChangeEmailInteractor {

    private final UserRepo userRepo;
    private final TransactionManager transactionManager;
    private final UserDomainService domainService;

    public void change(ChangeEmailCommand command) {
        var newEmailVo = new UserEmail(command.newEmail());
        transactionManager.inTransaction(() -> {
            var user = userRepo.readById(command.id())
                    .orElseThrow(() -> new UserNotFoundException("User was not found"));
            if (!user.getEmail().getEmail().equalsIgnoreCase(command.oldEmail().trim())) {
                throw new InvalidCredentialsException("Invalid current email");
            }
            var existingWithNewEmail = userRepo.readByEmail(newEmailVo.getEmail());
            if (existingWithNewEmail.isPresent()
                    && !existingWithNewEmail.get().getId().equals(user.getId())) {
                throw new UserAlreadyExistsException("User with this email already exists");
            }
            domainService.updateEmail(user, newEmailVo.getEmail());
            userRepo.update(user);
        });
    }
}
