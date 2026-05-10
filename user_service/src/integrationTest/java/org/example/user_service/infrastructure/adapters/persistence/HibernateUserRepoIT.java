package org.example.user_service.infrastructure.adapters.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.EntityManager;

import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.vo.UserName;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.infrastructure.persistence.mappers.UserMapperHibernate;
import org.example.user_service.support.factories.UserFactory;
import org.example.user_service.support.integration.PostgresIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class HibernateUserRepoIT extends PostgresIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    private HibernateUserRepo repo;

    @BeforeEach
    void setUp() {
        // UserMapperHibernate has only `default` methods; an anonymous implementation
        // gives us the same behavior without depending on the MapStruct-generated bean.
        UserMapperHibernate mapper = new UserMapperHibernate() {
        };
        repo = new HibernateUserRepo(entityManager, mapper);
    }

    @Test
    @DisplayName("add persists a user that can later be read back by id and email")
    void shouldAddAndReadBack() {
        // Arrange
        User user = UserFactory.aUser();

        // Act
        repo.add(user);
        flush();
        Optional<User> byId = repo.readById(user.getId());
        Optional<User> byEmail = repo.readByEmail(user.getEmail().getEmail());

        // Assert
        assertThat(byId).isPresent();
        assertThat(byId.get().getEmail().getEmail()).isEqualTo(user.getEmail().getEmail());
        assertThat(byEmail).isPresent();
        assertThat(byEmail.get().getId()).isEqualTo(user.getId());
    }

    @Test
    @DisplayName("readById returns empty for unknown ids")
    void shouldReturnEmptyForUnknownId() {
        // Arrange + Act
        Optional<User> result = repo.readById(UUID.randomUUID());

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("readByEmail returns empty for unknown emails")
    void shouldReturnEmptyForUnknownEmail() {
        // Arrange + Act
        Optional<User> result = repo.readByEmail("nobody@example.com");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("update overwrites mutable fields and preserves identity")
    void shouldUpdateExistingUser() {
        // Arrange
        User user = UserFactory.aUser();
        repo.add(user);
        flush();
        user.setName(new UserName("Пётр"));
        user.setRole(new UserRole(UserRole.AUTHOR));

        // Act
        repo.update(user);
        flush();
        User reloaded = repo.readById(user.getId()).orElseThrow();

        // Assert
        assertThat(reloaded.getName().getName()).isEqualTo("Пётр");
        assertThat(reloaded.getRole().getRole()).isEqualTo(UserRole.AUTHOR);
        assertThat(reloaded.getId()).isEqualTo(user.getId());
    }

    @Test
    @DisplayName("update throws UserNotFoundException when the user does not exist")
    void shouldThrowOnUpdateWhenUserMissing() {
        // Arrange
        User user = UserFactory.aUserWithId(UUID.randomUUID());

        // Act + Assert
        assertThatThrownBy(() -> repo.update(user))
                .isInstanceOf(UserNotFoundException.class);
    }

    private void flush() {
        entityManager.flush();
        entityManager.clear();
    }
}
