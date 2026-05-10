package org.example.user_service.domain.user.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.example.user_service.domain.base.BaseDomainEvent;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.fakes.FakePasswordHasher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserDomainServiceTest {

    @Test
    @DisplayName("add hashes the password, builds a USER and records CreateUserDomainEvent")
    void shouldHashPasswordBuildUserAndRecordEvent() {
        // Arrange
        FakePasswordHasher hasher = new FakePasswordHasher();
        UserDomainService service = new UserDomainService(hasher);

        // Act
        User user = service.add(
                "Иванов",
                "Иван",
                "Иванович",
                "STUDENT",
                "user@example.com",
                "Password1",
                "https://example.com/photo.png"
        );

        // Assert
        assertThat(user.getId()).isNotNull();
        assertThat(user.getEmail().getEmail()).isEqualTo("user@example.com");
        assertThat(user.getPassword().getPassword()).isEqualTo("Password1");
        assertThat(user.getRole().getRole()).isEqualTo(UserRole.DEFAULT);
        List<BaseDomainEvent> events = service.getEvents();
        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOf(CreateUserDomainEvent.class);
    }

    @Test
    @DisplayName("pull_events returns recorded events and clears the buffer")
    void shouldDrainEventsOnPull() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        service.add(
                "Иванов",
                "Иван",
                "Иванович",
                "STUDENT",
                "user@example.com",
                "Password1",
                "https://example.com/photo.png"
        );

        // Act
        List<BaseDomainEvent> pulled = service.pull_events();

        // Assert
        assertThat(pulled).hasSize(1);
        assertThat(service.getEvents()).isEmpty();
    }

    @Test
    @DisplayName("updateName replaces the existing UserName")
    void shouldUpdateName() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.updateName(user, "Пётр");

        // Assert
        assertThat(user.getName().getName()).isEqualTo("Пётр");
    }

    @Test
    @DisplayName("updateSurname replaces the existing UserSurname")
    void shouldUpdateSurname() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.updateSurname(user, "Петров");

        // Assert
        assertThat(user.getSurname().getSurname()).isEqualTo("Петров");
    }

    @Test
    @DisplayName("updatePatronymic replaces the existing UserPatronymic")
    void shouldUpdatePatronymic() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.updatePatronymic(user, "Петрович");

        // Assert
        assertThat(user.getPatronymic().getPatronymic()).isEqualTo("Петрович");
    }

    @Test
    @DisplayName("updateStatus replaces the existing UserStatus")
    void shouldUpdateStatus() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.updateStatus(user, "GRADUATE");

        // Assert
        assertThat(user.getUserStatus().getStatus()).isEqualTo("GRADUATE");
    }

    @Test
    @DisplayName("updateProfilePhotoLink replaces the existing photo link")
    void shouldUpdateProfilePhotoLink() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.updateProfilePhotoLink(user, "https://example.com/new.png");

        // Assert
        assertThat(user.getProfilePhotoLink().getProfilePhotoLink())
                .isEqualTo("https://example.com/new.png");
    }

    @Test
    @DisplayName("assignAuthorRole promotes the user to AUTHOR")
    void shouldAssignAuthorRole() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.assignAuthorRole(user);

        // Assert
        assertThat(user.getRole().getRole()).isEqualTo(UserRole.AUTHOR);
    }

    @Test
    @DisplayName("assignAdminRole promotes the user to ADMIN")
    void shouldAssignAdminRole() {
        // Arrange
        UserDomainService service = new UserDomainService(new FakePasswordHasher());
        User user = UserFactory.aUser();

        // Act
        service.assignAdminRole(user);

        // Assert
        assertThat(user.getRole().getRole()).isEqualTo(UserRole.ADMIN);
    }
}
