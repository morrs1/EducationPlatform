package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserSurnameTest {

    @Test
    @DisplayName("accepts a Cyrillic surname")
    void shouldAcceptCyrillicSurname() {
        // Arrange + Act
        UserSurname surname = new UserSurname("Иванов");

        // Assert
        assertThat(surname.getSurname()).isEqualTo("Иванов");
    }

    @ParameterizedTest(name = "[{index}] rejects \"{0}\"")
    @NullSource
    @ValueSource(strings = {
            "",
            "  ",
            "A",
            "Иванов1",
            "Иванов!",
            "."
    })
    @DisplayName("rejects null, blank, too short or pattern-violating values")
    void shouldRejectInvalidSurnames(String invalid) {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserSurname(invalid))
                .isInstanceOf(ValidateException.class);
    }

    @Test
    @DisplayName("rejects surnames longer than 50 characters")
    void shouldRejectTooLongSurname() {
        // Arrange
        String tooLong = "Иванов".repeat(10); // 60 chars

        // Act + Assert
        assertThatThrownBy(() -> new UserSurname(tooLong))
                .isInstanceOf(ValidateException.class);
    }
}
