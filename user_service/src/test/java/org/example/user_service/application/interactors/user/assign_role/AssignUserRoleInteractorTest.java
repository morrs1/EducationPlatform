package org.example.user_service.application.interactors.user.assign_role;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AssignUserRoleInteractorTest {

    @Test
    @DisplayName("assignAuthor promotes the user to AUTHOR and persists the change")
    void shouldPromoteUserToAuthor() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo userRepo = FakeUserRepo.withUser(user);
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );

        // Act
        interactor.assignAuthor(new AssignUserRoleCommand(user.getId()));

        // Assert
        assertThat(userRepo.updateCalls()).isEqualTo(1);
        assertThat(userRepo.lastUpdated().getRole().getRole()).isEqualTo(UserRole.AUTHOR);
    }

    @Test
    @DisplayName("assignAdmin promotes the user to ADMIN and persists the change")
    void shouldPromoteUserToAdmin() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo userRepo = FakeUserRepo.withUser(user);
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );

        // Act
        interactor.assignAdmin(new AssignUserRoleCommand(user.getId()));

        // Assert
        assertThat(userRepo.updateCalls()).isEqualTo(1);
        assertThat(userRepo.lastUpdated().getRole().getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    @DisplayName("assignAuthor throws UserNotFoundException when the user does not exist")
    void shouldThrowWhenUserNotFoundForAuthor() {
        // Arrange
        FakeUserRepo userRepo = FakeUserRepo.empty();
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.assignAuthor(new AssignUserRoleCommand(UUID.randomUUID())))
                .isInstanceOf(UserNotFoundException.class);
        assertThat(userRepo.updateCalls()).isZero();
    }

    @Test
    @DisplayName("assignAdmin throws UserNotFoundException when the user does not exist")
    void shouldThrowWhenUserNotFoundForAdmin() {
        // Arrange
        FakeUserRepo userRepo = FakeUserRepo.empty();
        AssignUserRoleInteractor interactor = new AssignUserRoleInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.assignAdmin(new AssignUserRoleCommand(UUID.randomUUID())))
                .isInstanceOf(UserNotFoundException.class);
        assertThat(userRepo.updateCalls()).isZero();
    }
}
