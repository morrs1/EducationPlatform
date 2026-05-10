package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserStatusTest {

    @Test
    @DisplayName("accepts any non-null status")
    void shouldAcceptNonNullStatus() {
        // Arrange + Act
        UserStatus status = new UserStatus("STUDENT");

        // Assert
        assertThat(status.getStatus()).isEqualTo("STUDENT");
    }

    @Test
    @DisplayName("rejects null")
    void shouldRejectNull() {
        // Arrange + Act + Assert
        assertThatThrownBy(() -> new UserStatus(null))
                .isInstanceOf(ValidateException.class);
    }
}
