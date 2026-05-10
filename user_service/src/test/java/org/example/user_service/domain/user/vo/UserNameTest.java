package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserNameTest {

    @Test
    @DisplayName("accepts a Cyrillic name")
    void shouldAcceptCyrillicName() {
        // Arrange + Act
        UserName name = new UserName("Иван");

        // Assert
        assertThat(name.getName()).isEqualTo("Иван");
    }

    @Test
    @DisplayName("accepts a Latin compound name with hyphen")
    void shouldAcceptCompoundName() {
        // Arrange + Act
        UserName name = new UserName("Jean-Luc");

        // Assert
        assertThat(name.getName()).isEqualTo("Jean-Luc");
    }

    @ParameterizedTest(name = "[{index}] rejects \"{0}\"")
    @NullSource
    @ValueSource(strings = {
            "",
            "  ",
            "A",
            "Иван1",
            "Иван@",
            "_underscore"
    })
    @DisplayName("rejects null, blank, too short or pattern-violating values")
    void shouldRejectInvalidNames(String invalid) {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserName(invalid))
                .isInstanceOf(ValidateException.class);
    }

    @Test
    @DisplayName("rejects names longer than 50 characters")
    void shouldRejectTooLongName() {
        // Arrange
        String tooLong = "Иван".repeat(20); // 80 chars

        // Act + Assert
        assertThatThrownBy(() -> new UserName(tooLong))
                .isInstanceOf(ValidateException.class);
    }
}
