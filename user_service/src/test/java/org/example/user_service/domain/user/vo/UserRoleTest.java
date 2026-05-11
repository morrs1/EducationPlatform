package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class UserRoleTest {

    @ParameterizedTest(name = "[{index}] \"{0}\" -> \"{1}\"")
    @CsvSource({
            "USER, USER",
            "AUTHOR, AUTHOR",
            "ADMIN, ADMIN",
            "user, USER",
            "  admin  , ADMIN"
    })
    @DisplayName("normalises case and trims whitespace")
    void shouldNormaliseCaseAndTrimWhitespace(String raw, String expected) {
        // Arrange + Act
        UserRole role = new UserRole(raw);

        // Assert
        assertThat(role.getRole()).isEqualTo(expected);
    }

    @ParameterizedTest(name = "[{index}] null or blank -> DEFAULT")
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    @DisplayName("falls back to USER for null or blank input")
    void shouldFallBackToDefaultForNullOrBlank(String input) {
        // Arrange + Act
        UserRole role = new UserRole(input);

        // Assert
        assertThat(role.getRole()).isEqualTo(UserRole.DEFAULT);
    }

    @Test
    @DisplayName("rejects unsupported role values")
    void shouldRejectUnsupportedRole() {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserRole("SUPERUSER"))
                .isInstanceOf(ValidateException.class)
                .hasMessageContaining("Unsupported user role");
    }
}
