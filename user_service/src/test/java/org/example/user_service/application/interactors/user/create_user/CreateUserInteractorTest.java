package org.example.user_service.application.interactors.user.create_user;

import org.example.user_service.application.exceptions.UserAlreadyExistsException;
import org.example.user_service.application.ports.EventBus;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.base.BaseDomainEvent;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.domain.user.vo.UserEmail;
import org.example.user_service.domain.user.vo.UserName;
import org.example.user_service.domain.user.vo.UserPassword;
import org.example.user_service.domain.user.vo.UserPatronymic;
import org.example.user_service.domain.user.vo.UserProfilePhotoLink;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.domain.user.vo.UserStatus;
import org.example.user_service.domain.user.vo.UserSurname;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CreateUserInteractorTest {

    @Test
    void addThrowsBeforeHashingPasswordWhenEmailAlreadyExists() {
        CountingPasswordHasher passwordHasher = new CountingPasswordHasher();
        InMemoryUserRepo userRepo = new InMemoryUserRepo(existingUser("user@example.com"));
        CreateUserInteractor interactor = new CreateUserInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(passwordHasher),
                new NoopEventBus()
        );

        assertThrows(
                UserAlreadyExistsException.class,
                () -> interactor.add(new CreateUserCommand(
                        "Иванов",
                        "Иван",
                        "Иванович",
                        "USER",
                        "user@example.com",
                        "Password1",
                        null
                ))
        );

        assertEquals(0, passwordHasher.hashCalls);
        assertEquals(0, userRepo.addCalls);
    }

    private static User existingUser(String email) {
        return new User(
                UUID.randomUUID(),
                new UserSurname("Петров"),
                new UserName("Пётр"),
                new UserPatronymic("Петрович"),
                new UserStatus("USER"),
                new UserEmail(email),
                new UserPassword("Password1"),
                new UserProfilePhotoLink("https://example.com/photo.png"),
                new UserRole("USER")
        );
    }

    private static final class CountingPasswordHasher implements PasswordHasher {

        private int hashCalls;

        @Override
        public String hash(String rawPassword) {
            hashCalls++;
            return rawPassword;
        }

        @Override
        public Boolean verify(String rawPassword, String hashedPassword) {
            return rawPassword.equals(hashedPassword);
        }
    }

    private static final class InMemoryUserRepo implements UserRepo {

        private final User existingUser;
        private int addCalls;

        private InMemoryUserRepo(User existingUser) {
            this.existingUser = existingUser;
        }

        @Override
        public UUID add(User user) {
            addCalls++;
            return user.getId();
        }

        @Override
        public Optional<User> readByEmail(String userEmail) {
            return Optional.ofNullable(existingUser)
                    .filter(u -> u.getEmail().getEmail().equals(userEmail));
        }

        @Override
        public Optional<User> readById(UUID id) {
            return Optional.empty();
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

    private static final class NoopEventBus implements EventBus {

        @Override
        public void publish(List<BaseDomainEvent> events) {
        }
    }
}
