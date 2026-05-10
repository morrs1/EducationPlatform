package org.example.user_service.application.interactors.user.create_user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.UserAlreadyExistsException;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.support.factories.CreateUserCommandFactory;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.CountingPasswordHasher;
import org.example.user_service.support.fakes.FakeEventBus;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CreateUserInteractorTest {

    @Test
    @DisplayName("persists the user, publishes the create event and returns its id")
    void shouldPersistUserAndPublishEvent() {
        // Arrange
        FakeUserRepo userRepo = FakeUserRepo.empty();
        FakeEventBus eventBus = new FakeEventBus();
        CountingPasswordHasher hasher = new CountingPasswordHasher();
        CreateUserInteractor interactor = new CreateUserInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(hasher),
                eventBus
        );
        CreateUserCommand command = CreateUserCommandFactory.aCommand();

        // Act
        UUID createdId = interactor.add(command);

        // Assert
        assertThat(createdId).isNotNull();
        assertThat(userRepo.addCalls()).isEqualTo(1);
        assertThat(userRepo.lastAdded().getEmail().getEmail()).isEqualTo(command.userEmail());
        assertThat(hasher.hashCalls()).isEqualTo(1);
        assertThat(eventBus.publishedCount()).isEqualTo(1);
        assertThat(eventBus.published().get(0)).isInstanceOf(CreateUserDomainEvent.class);
    }

    @Test
    @DisplayName("throws UserAlreadyExistsException without hashing or persisting on duplicate email")
    void shouldRejectDuplicateEmailWithoutSideEffects() {
        // Arrange
        FakeUserRepo userRepo = FakeUserRepo.withUser(UserFactory.aUserWithEmail("user@example.com"));
        CountingPasswordHasher hasher = new CountingPasswordHasher();
        FakeEventBus eventBus = new FakeEventBus();
        CreateUserInteractor interactor = new CreateUserInteractor(
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(hasher),
                eventBus
        );
        CreateUserCommand command = CreateUserCommandFactory.aCommandWithEmail("user@example.com");

        // Act + Assert
        assertThatThrownBy(() -> interactor.add(command))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("user@example.com");
        assertThat(hasher.hashCalls()).isZero();
        assertThat(userRepo.addCalls()).isZero();
        assertThat(eventBus.publishedCount()).isZero();
    }
}
