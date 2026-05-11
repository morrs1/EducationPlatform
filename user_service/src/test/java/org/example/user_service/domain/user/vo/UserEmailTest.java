package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserEmailTest {

    @Test
    @DisplayName("accepts a well-formed email")
    void shouldAcceptWellFormedEmail() {
        // Arrange
        String raw = "user@example.com";

        // Act
        UserEmail email = new UserEmail(raw);

        // Assert
        assertThat(email.getEmail()).isEqualTo(raw);
    }

    @ParameterizedTest(name = "[{index}] rejects \"{0}\"")
    @NullSource
    @ValueSource(strings = {
            "",
            "   ",
            "no-at-sign.com",
            "@example.com",
            "user@",
            "user@nodot",
            "user@example.c"
    })
    @DisplayName("rejects null, blank, and malformed values")
    void shouldRejectNullBlankOrMalformed(String invalid) {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserEmail(invalid))
                .isInstanceOf(ValidateException.class);
    }

    @Test
    @DisplayName("rejects emails longer than 254 characters")
    void shouldRejectEmailLongerThan254Characters() {
        // Arrange
        String tooLong = "a".repeat(245) + "@aa.com"; // 245 + 7 = 252 — still valid
        String overLimit = "a".repeat(248) + "@aa.com"; // 248 + 7 = 255 — over limit

        // Act + Assert
        assertThat(new UserEmail(tooLong).getEmail()).hasSize(252);
        assertThatThrownBy(() -> new UserEmail(overLimit))
                .isInstanceOf(ValidateException.class)
                .hasMessageContaining("254");
    }
}
