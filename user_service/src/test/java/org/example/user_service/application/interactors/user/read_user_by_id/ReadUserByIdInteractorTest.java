package org.example.user_service.application.interactors.user.read_user_by_id;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.interactors.mappers.UserViewMapper;
import org.example.user_service.domain.user.User;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReadUserByIdInteractorTest {

    @Test
    @DisplayName("returns the user view for an existing id")
    void shouldReturnUserView() {
        // Arrange
        User user = UserFactory.aUser();
        ReadUserByIdInteractor interactor = new ReadUserByIdInteractor(
                new ImmediateTransactionManager(),
                FakeUserRepo.withUser(user),
                new UserViewMapper()
        );

        // Act
        ReadUserByIdView view = interactor.readById(user.getId());

        // Assert
        assertThat(view.userEmail()).isEqualTo(user.getEmail().getEmail());
        assertThat(view.surname()).isEqualTo(user.getSurname().getSurname());
        assertThat(view.name()).isEqualTo(user.getName().getName());
        assertThat(view.patronymic()).isEqualTo(user.getPatronymic().getPatronymic());
        assertThat(view.userStatus()).isEqualTo(user.getUserStatus().getStatus());
        assertThat(view.userProfilePhotoLink()).isEqualTo(user.getProfilePhotoLink().getProfilePhotoLink());
        assertThat(view.role()).isEqualTo(user.getRole().getRole());
    }

    @Test
    @DisplayName("throws UserNotFoundException when no user matches the id")
    void shouldThrowWhenUserNotFound() {
        // Arrange
        ReadUserByIdInteractor interactor = new ReadUserByIdInteractor(
                new ImmediateTransactionManager(),
                FakeUserRepo.empty(),
                new UserViewMapper()
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.readById(UUID.randomUUID()))
                .isInstanceOf(UserNotFoundException.class);
    }
}
