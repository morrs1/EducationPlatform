package org.example.user_service.application.interactors.user.authenticate_user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.InvalidCredentialsException;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AuthenticateUserInteractorTest {

    @Test
    @DisplayName("returns the authenticated view when email and password match")
    void shouldReturnAuthenticatedViewOnValidCredentials() {
        // Arrange
        UUID userId = UUID.randomUUID();
        AuthenticateUserInteractor interactor = new AuthenticateUserInteractor(
                new ImmediateTransactionManager(),
                FakeUserRepo.withUser(UserFactory.builder()
                        .id(userId)
                        .email("user@example.com")
                        .password("Password1")
                        .build()),
                new FakePasswordHasher()
        );

        // Act
        AuthenticatedUserView view = interactor.authenticate(
                new AuthenticateUserCommand("user@example.com", "Password1")
        );

        // Assert
        assertThat(view.id()).isEqualTo(userId);
        assertThat(view.email()).isEqualTo("user@example.com");
        assertThat(view.role()).isEqualTo("USER");
    }

    @Test
    @DisplayName("throws InvalidCredentialsException when password does not match")
    void shouldRejectInvalidPassword() {
        // Arrange
        AuthenticateUserInteractor interactor = new AuthenticateUserInteractor(
                new ImmediateTransactionManager(),
                FakeUserRepo.withUser(UserFactory.aUserWithEmail("user@example.com")),
                new FakePasswordHasher()
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.authenticate(
                new AuthenticateUserCommand("user@example.com", "WrongPass1")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    @DisplayName("throws InvalidCredentialsException when email is not found")
    void shouldRejectUnknownEmail() {
        // Arrange
        AuthenticateUserInteractor interactor = new AuthenticateUserInteractor(
                new ImmediateTransactionManager(),
                FakeUserRepo.empty(),
                new FakePasswordHasher()
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.authenticate(
                new AuthenticateUserCommand("nobody@example.com", "Password1")))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
