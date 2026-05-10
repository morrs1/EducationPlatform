package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserPasswordTest {

    @Test
    @DisplayName("accepts a password with letters and digits")
    void shouldAcceptPasswordWithLettersAndDigits() {
        // Arrange
        String raw = "Password1";

        // Act
        UserPassword password = new UserPassword(raw);

        // Assert
        assertThat(password.getPassword()).isEqualTo(raw);
    }

    @ParameterizedTest(name = "[{index}] rejects \"{0}\"")
    @NullSource
    @ValueSource(strings = {
            "",
            "       ",
            "Short1",
            "onlyletters",
            "12345678",
            "NoDigitsHere"
    })
    @DisplayName("rejects null, blank, too short or pattern-violating values")
    void shouldRejectInvalidPasswords(String invalid) {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserPassword(invalid))
                .isInstanceOf(ValidateException.class);
    }

    @Test
    @DisplayName("rejects passwords longer than 128 characters")
    void shouldRejectTooLongPassword() {
        // Arrange
        String tooLong = "Aa" + "1".repeat(127); // 129 chars

        // Act + Assert
        assertThatThrownBy(() -> new UserPassword(tooLong))
                .isInstanceOf(ValidateException.class);
    }
}
