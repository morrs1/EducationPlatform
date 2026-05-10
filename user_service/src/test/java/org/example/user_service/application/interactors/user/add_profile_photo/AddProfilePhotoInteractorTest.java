package org.example.user_service.application.interactors.user.add_profile_photo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.services.UserDomainService;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.example.user_service.support.fakes.FakePhotoStorage;
import org.example.user_service.support.fakes.FakeUserRepo;
import org.example.user_service.support.fakes.ImmediateTransactionManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AddProfilePhotoInteractorTest {

    @Test
    @DisplayName("uploads the photo, updates the user's photo link and returns storage coords")
    void shouldUploadAndUpdateLink() {
        // Arrange
        User user = UserFactory.aUser();
        FakeUserRepo userRepo = FakeUserRepo.withUser(user);
        FakePhotoStorage photoStorage = new FakePhotoStorage();
        AddProfilePhotoInteractor interactor = new AddProfilePhotoInteractor(
                photoStorage,
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );
        AddProfilePhotoCommand command = new AddProfilePhotoCommand(
                user.getId(),
                "photo.png",
                "image/png",
                123L,
                new byte[] {1, 2, 3}
        );

        // Act
        AddProfilePhotoView view = interactor.add(command);

        // Assert
        assertThat(photoStorage.addCalls()).isEqualTo(1);
        assertThat(photoStorage.lastCommand()).isSameAs(command);
        assertThat(view.bucket()).isEqualTo(FakePhotoStorage.DEFAULT_BUCKET);
        assertThat(view.key()).isEqualTo(FakePhotoStorage.DEFAULT_KEY);
        assertThat(view.url()).isEqualTo(FakePhotoStorage.DEFAULT_URL);
        assertThat(userRepo.updateCalls()).isEqualTo(1);
        assertThat(userRepo.lastUpdated().getProfilePhotoLink().getProfilePhotoLink())
                .isEqualTo(FakePhotoStorage.DEFAULT_URL);
    }

    @Test
    @DisplayName("throws UserNotFoundException without uploading when the user does not exist")
    void shouldNotUploadWhenUserMissing() {
        // Arrange
        FakeUserRepo userRepo = FakeUserRepo.empty();
        FakePhotoStorage photoStorage = new FakePhotoStorage();
        AddProfilePhotoInteractor interactor = new AddProfilePhotoInteractor(
                photoStorage,
                new ImmediateTransactionManager(),
                userRepo,
                new UserDomainService(new FakePasswordHasher())
        );
        AddProfilePhotoCommand command = new AddProfilePhotoCommand(
                UUID.randomUUID(),
                "photo.png",
                "image/png",
                123L,
                new byte[] {1, 2, 3}
        );

        // Act + Assert
        assertThatThrownBy(() -> interactor.add(command))
                .isInstanceOf(UserNotFoundException.class);
        assertThat(photoStorage.addCalls()).isZero();
        assertThat(userRepo.updateCalls()).isZero();
    }
}
