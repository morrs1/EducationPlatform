package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class UserPatronymicTest {

    @Test
    @DisplayName("accepts a Cyrillic patronymic")
    void shouldAcceptCyrillicPatronymic() {
        // Arrange + Act
        UserPatronymic patronymic = new UserPatronymic("Иванович");

        // Assert
        assertThat(patronymic.getPatronymic()).isEqualTo("Иванович");
    }

    @ParameterizedTest(name = "[{index}] rejects \"{0}\"")
    @NullSource
    @ValueSource(strings = {
            "",
            "  ",
            "A",
            "Иванович1",
            "Иванович!"
    })
    @DisplayName("rejects null, blank, too short or pattern-violating values")
    void shouldRejectInvalidPatronymics(String invalid) {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserPatronymic(invalid))
                .isInstanceOf(ValidateException.class);
    }
}
