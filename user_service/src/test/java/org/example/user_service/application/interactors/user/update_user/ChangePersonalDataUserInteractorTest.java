package org.example.user_service.application.interactors.user.update_user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ChangePersonalDataUserInteractorTest {

    private ChangePersonalDataUserInteractor newInteractor(FakeUserRepo repo) {
        return new ChangePersonalDataUserInteractor(
                repo,
                new ImmediateTransactionManager(),
                new UserDomainService(new FakePasswordHasher())
        );
    }

    @Test
    @DisplayName("updateName replaces the user's first name and persists the change")
    void shouldUpdateName() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo repo = FakeUserRepo.withUser(user);
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act
        interactor.updateName(new ChangeUserNameCommand(user.getId(), "Пётр"));

        // Assert
        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getName().getName()).isEqualTo("Пётр");
    }

    @Test
    @DisplayName("updateSurname replaces the user's surname and persists the change")
    void shouldUpdateSurname() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo repo = FakeUserRepo.withUser(user);
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act
        interactor.updateSurname(new ChangeUserSurnameCommand(user.getId(), "Петров"));

        // Assert
        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getSurname().getSurname()).isEqualTo("Петров");
    }

    @Test
    @DisplayName("updatePatronymic replaces the user's patronymic and persists the change")
    void shouldUpdatePatronymic() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo repo = FakeUserRepo.withUser(user);
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act
        interactor.updatePatronymic(new ChangeUserPatronymicCommand(user.getId(), "Петрович"));

        // Assert
        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getPatronymic().getPatronymic()).isEqualTo("Петрович");
    }

    @Test
    @DisplayName("updateStatus replaces the user's status and persists the change")
    void shouldUpdateStatus() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo repo = FakeUserRepo.withUser(user);
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act
        interactor.updateStatus(new ChangeUserStatusCommand(user.getId(), "GRADUATE"));

        // Assert
        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getUserStatus().getStatus()).isEqualTo("GRADUATE");
    }

    @Test
    @DisplayName("updateName throws UserNotFoundException when user does not exist")
    void shouldThrowOnMissingUserForName() {
        // Arrange
        FakeUserRepo repo = FakeUserRepo.empty();
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act + Assert
        assertThatThrownBy(() -> interactor.updateName(
                new ChangeUserNameCommand(UUID.randomUUID(), "Пётр")))
                .isInstanceOf(UserNotFoundException.class);
        assertThat(repo.updateCalls()).isZero();
    }

    @Test
    @DisplayName("updateSurname throws UserNotFoundException when user does not exist")
    void shouldThrowOnMissingUserForSurname() {
        // Arrange
        FakeUserRepo repo = FakeUserRepo.empty();
        ChangePersonalDataUserInteractor interactor = newInteractor(repo);

        // Act + Assert
        assertThatThrownBy(() -> interactor.updateSurname(
                new ChangeUserSurnameCommand(UUID.randomUUID(), "Петров")))
                .isInstanceOf(UserNotFoundException.class);
        assertThat(repo.updateCalls()).isZero();
    }
}
