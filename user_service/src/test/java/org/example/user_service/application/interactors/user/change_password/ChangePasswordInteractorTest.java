package org.example.user_service.application.interactors.user.change_password;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ChangePasswordInteractorTest {

    private ChangePasswordInteractor newInteractor(FakeUserRepo repo) {
        FakePasswordHasher hasher = new FakePasswordHasher();
        return new ChangePasswordInteractor(
                repo,
                new ImmediateTransactionManager(),
                new UserDomainService(hasher),
                hasher
        );
    }

    @Test
    @DisplayName("change updates password when current password matches")
    void shouldChangePassword() {
        var user = UserFactory.aUser();
        var repo = FakeUserRepo.withUser(user);
        var interactor = newInteractor(repo);

        interactor.change(
                new ChangePasswordCommand(user.getId(), UserFactory.DEFAULT_PASSWORD, "NewPass99"));

        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getPassword().getPassword()).isEqualTo("NewPass99");
    }

    @Test
    @DisplayName("change throws when current password is wrong")
    void shouldRejectWrongCurrentPassword() {
        var user = UserFactory.aUser();
        var repo = FakeUserRepo.withUser(user);
        var interactor = newInteractor(repo);

        assertThatThrownBy(() -> interactor.change(
                new ChangePasswordCommand(user.getId(), "wrong", "NewPass99")))
                .isInstanceOf(InvalidCredentialsException.class);
        assertThat(repo.updateCalls()).isZero();
    }

    @Test
    @DisplayName("change throws when user is missing")
    void shouldThrowWhenUserMissing() {
        var repo = FakeUserRepo.empty();
        var interactor = newInteractor(repo);

        assertThatThrownBy(() -> interactor.change(
                new ChangePasswordCommand(UUID.randomUUID(), "x", "NewPass99")))
                .isInstanceOf(UserNotFoundException.class);
    }
}
