package org.example.user_service.application.interactors.user.authenticate_user;

import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.vo.UserEmail;
import org.example.user_service.domain.user.vo.UserName;
import org.example.user_service.domain.user.vo.UserPassword;
import org.example.user_service.domain.user.vo.UserPatronymic;
import org.example.user_service.domain.user.vo.UserProfilePhotoLink;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.domain.user.vo.UserStatus;
import org.example.user_service.domain.user.vo.UserSurname;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthenticateUserInteractorTest {

    @Test
    void authenticateReturnsUserWhenPasswordIsValid() {
        UUID userId = UUID.randomUUID();
        AuthenticateUserInteractor interactor = new AuthenticateUserInteractor(
                new ImmediateTransactionManager(),
                new SingleUserRepo(user(userId)),
                new PlainPasswordHasher()
        );

        AuthenticatedUserView view = interactor.authenticate(
                new AuthenticateUserCommand("user@example.com", "Password1")
        );

        assertEquals(userId, view.id());
        assertEquals("user@example.com", view.email());
        assertEquals("USER", view.role());
    }

    @Test
    void authenticateThrowsWhenPasswordIsInvalid() {
        AuthenticateUserInteractor interactor = new AuthenticateUserInteractor(
                new ImmediateTransactionManager(),
                new SingleUserRepo(user(UUID.randomUUID())),
                new PlainPasswordHasher()
        );

        assertThrows(
                InvalidCredentialsException.class,
                () -> interactor.authenticate(new AuthenticateUserCommand("user@example.com", "wrong"))
        );
    }

    private static User user(UUID userId) {
        return new User(
                userId,
                new UserSurname("Иванов"),
                new UserName("Иван"),
                new UserPatronymic("Иванович"),
                new UserStatus("STUDENT"),
                new UserEmail("user@example.com"),
                new UserPassword("Password1"),
                new UserProfilePhotoLink("https://example.com/photo.png"),
                new UserRole("USER")
        );
    }

    private static final class PlainPasswordHasher implements PasswordHasher {

        @Override
        public String hash(String rawPassword) {
            return rawPassword;
        }

        @Override
        public Boolean verify(String rawPassword, String hashedPassword) {
            return rawPassword.equals(hashedPassword);
        }
    }

    private static final class SingleUserRepo implements UserRepo {

        private final User user;

        private SingleUserRepo(User user) {
            this.user = user;
        }

        @Override
        public UUID add(User user) {
            return user.getId();
        }

        @Override
        public Optional<User> readByEmail(String userEmail) {
            return Optional.of(user).filter(u -> u.getEmail().getEmail().equals(userEmail));
        }

        @Override
        public Optional<User> readById(UUID id) {
            return Optional.of(user).filter(u -> u.getId().equals(id));
        }

        @Override
        public void update(User user) {
        }
    }

    private static final class ImmediateTransactionManager implements TransactionManager {

        @Override
        public void inTransaction(Runnable action) {
            action.run();
        }

        @Override
        public <T> T inTransaction(Supplier<T> action) {
            return action.get();
        }
    }
}
