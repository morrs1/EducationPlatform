package org.example.user_service.application.interactors.user.authenticate_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.ports.PasswordHasher;

@RequiredArgsConstructor
public class AuthenticateUserInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final PasswordHasher passwordHasher;

    public AuthenticatedUserView authenticate(AuthenticateUserCommand command) {
        return transactionManager.inTransaction(() -> {
            User user = userRepo.readByEmail(command.email())
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

            if (!passwordHasher.verify(command.password(), user.getPassword().getPassword())) {
                throw new InvalidCredentialsException("Invalid email or password");
            }

            return new AuthenticatedUserView(
                    user.getId(),
                    user.getEmail().getEmail(),
                    user.getRole().getRole(),
                    user.getUserStatus().getStatus()
            );
        });
    }
}
