package org.example.user_service.application.interactors.user.change_email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.application.exceptions.UserAlreadyExistsException;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ChangeEmailInteractorTest {

    private ChangeEmailInteractor newInteractor(FakeUserRepo repo) {
        return new ChangeEmailInteractor(
                repo,
                new ImmediateTransactionManager(),
                new UserDomainService(new FakePasswordHasher())
        );
    }

    @Test
    @DisplayName("change updates email when current email matches")
    void shouldChangeEmail() {
        var user = UserFactory.aUser();
        var repo = FakeUserRepo.withUser(user);
        var interactor = newInteractor(repo);

        interactor.change(new ChangeEmailCommand(
                user.getId(),
                UserFactory.DEFAULT_EMAIL,
                "new.owner@example.com"));

        assertThat(repo.updateCalls()).isEqualTo(1);
        assertThat(repo.lastUpdated().getEmail().getEmail()).isEqualTo("new.owner@example.com");
    }

    @Test
    @DisplayName("change accepts current email case-insensitively")
    void shouldMatchOldEmailCaseInsensitive() {
        var user = UserFactory.aUserWithEmail("MixedCase@Example.com");
        var repo = FakeUserRepo.withUser(user);
        var interactor = newInteractor(repo);

        interactor.change(new ChangeEmailCommand(
                user.getId(),
                "mixedcase@example.com",
                "after@example.com"));

        assertThat(repo.lastUpdated().getEmail().getEmail()).isEqualTo("after@example.com");
    }

    @Test
    @DisplayName("change throws when current email is wrong")
    void shouldRejectWrongCurrentEmail() {
        var user = UserFactory.aUser();
        var repo = FakeUserRepo.withUser(user);
        var interactor = newInteractor(repo);

        assertThatThrownBy(() -> interactor.change(
                new ChangeEmailCommand(user.getId(), "wrong@example.com", "new.owner@example.com")))
                .isInstanceOf(InvalidCredentialsException.class);
        assertThat(repo.updateCalls()).isZero();
    }

    @Test
    @DisplayName("change throws when new email is taken by another user")
    void shouldRejectDuplicateEmail() {
        var owner = UserFactory.aUserWithEmail("owner@example.com");
        var other = UserFactory.aUserWithEmail("taken@example.com");
        var repo = FakeUserRepo.empty();
        repo.add(owner);
        repo.add(other);
        var interactor = newInteractor(repo);

        assertThatThrownBy(() -> interactor.change(
                new ChangeEmailCommand(owner.getId(), "owner@example.com", "taken@example.com")))
                .isInstanceOf(UserAlreadyExistsException.class);
    }

    @Test
    @DisplayName("change throws when user is missing")
    void shouldThrowWhenUserMissing() {
        var repo = FakeUserRepo.empty();
        var interactor = newInteractor(repo);

        assertThatThrownBy(() -> interactor.change(
                new ChangeEmailCommand(UUID.randomUUID(), "a@b.com", "c@d.com")))
                .isInstanceOf(UserNotFoundException.class);
    }
}
