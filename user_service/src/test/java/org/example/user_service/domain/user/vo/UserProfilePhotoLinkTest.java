package org.example.user_service.domain.user.vo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.example.user_service.domain.base.exceptions.ValidateException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserProfilePhotoLinkTest {

    @Test
    @DisplayName("accepts a regular URL")
    void shouldAcceptRegularUrl() {
        // Arrange + Act
        UserProfilePhotoLink link = new UserProfilePhotoLink("https://example.com/photo.png");

        // Assert
        assertThat(link.getProfilePhotoLink()).isEqualTo("https://example.com/photo.png");
    }

    @Test
    @DisplayName("accepts null (photo is optional)")
    void shouldAcceptNull() {
        // Arrange + Act
        UserProfilePhotoLink link = new UserProfilePhotoLink(null);

        // Assert
        assertThat(link.getProfilePhotoLink()).isNull();
    }

    @Test
    @DisplayName("rejects links longer than 1024 characters")
    void shouldRejectTooLongLink() {
        // Arrange
        String tooLong = "https://example.com/" + "a".repeat(1100);

        // Act + Assert
        assertThatThrownBy(() -> new UserProfilePhotoLink(tooLong))
                .isInstanceOf(ValidateException.class);
    }
}
