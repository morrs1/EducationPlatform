package org.example.user_service.application.interactors.user.assign_role;

import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
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

import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AssignUserRoleInteractorTest {

    @Test
    void assignAuthorSetsUserRoleToAuthor() {
        InMemoryUserRepo userRepo = new InMemoryUserRepo(user(UUID.randomUUID()));
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new PlainPasswordHasher())
        );

        interactor.assignAuthor(new AssignUserRoleCommand(userRepo.user.getId()));

        assertEquals(UserRole.AUTHOR, userRepo.updatedUser.getRole().getRole());
    }

    @Test
    void assignAdminSetsUserRoleToAdmin() {
        InMemoryUserRepo userRepo = new InMemoryUserRepo(user(UUID.randomUUID()));
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new PlainPasswordHasher())
        );

        interactor.assignAdmin(new AssignUserRoleCommand(userRepo.user.getId()));

        assertEquals(UserRole.ADMIN, userRepo.updatedUser.getRole().getRole());
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
                new UserRole(UserRole.DEFAULT)
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

    private static final class InMemoryUserRepo implements UserRepo {

        private final User user;
        private User updatedUser;

        private InMemoryUserRepo(User user) {
            this.user = user;
        }

        @Override
        public UUID add(User user) {
            return user.getId();
        }

        @Override
        public Optional<User> readByEmail(String userEmail) {
            return Optional.empty();
        }

        @Override
        public Optional<User> readById(UUID id) {
            return Optional.of(user).filter(u -> u.getId().equals(id));
        }

        @Override
        public void update(User user) {
            updatedUser = user;
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
