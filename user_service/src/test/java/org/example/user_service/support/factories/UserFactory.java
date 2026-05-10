package org.example.user_service.support.factories;

import java.util.UUID;

import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.vo.UserEmail;
import org.example.user_service.domain.user.vo.UserName;
import org.example.user_service.domain.user.vo.UserPassword;
import org.example.user_service.domain.user.vo.UserPatronymic;
import org.example.user_service.domain.user.vo.UserProfilePhotoLink;
import org.example.user_service.domain.user.vo.UserRole;
import org.example.user_service.domain.user.vo.UserStatus;
import org.example.user_service.domain.user.vo.UserSurname;

public final class UserFactory {

    public static final String DEFAULT_SURNAME = "Иванов";
    public static final String DEFAULT_NAME = "Иван";
    public static final String DEFAULT_PATRONYMIC = "Иванович";
    public static final String DEFAULT_STATUS = "STUDENT";
    public static final String DEFAULT_EMAIL = "user@example.com";
    public static final String DEFAULT_PASSWORD = "Password1";
    public static final String DEFAULT_PHOTO_LINK = "https://example.com/photo.png";
    public static final String DEFAULT_ROLE = UserRole.DEFAULT;

    private UserFactory() {
    }

    public static User aUser() {
        return builder().build();
    }

    public static User aUserWithId(UUID id) {
        return builder().id(id).build();
    }

    public static User aUserWithEmail(String email) {
        return builder().email(email).build();
    }

    public static User aUserWithRole(String role) {
        return builder().role(role).build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private UUID id = UUID.randomUUID();
        private String surname = DEFAULT_SURNAME;
        private String name = DEFAULT_NAME;
        private String patronymic = DEFAULT_PATRONYMIC;
        private String status = DEFAULT_STATUS;
        private String email = DEFAULT_EMAIL;
        private String password = DEFAULT_PASSWORD;
        private String profilePhotoLink = DEFAULT_PHOTO_LINK;
        private String role = DEFAULT_ROLE;

        private Builder() {
        }

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder surname(String surname) {
            this.surname = surname;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder patronymic(String patronymic) {
            this.patronymic = patronymic;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder password(String password) {
            this.password = password;
            return this;
        }

        public Builder profilePhotoLink(String profilePhotoLink) {
            this.profilePhotoLink = profilePhotoLink;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public User build() {
            return new User(
                    id,
                    new UserSurname(surname),
                    new UserName(name),
                    new UserPatronymic(patronymic),
                    new UserStatus(status),
                    new UserEmail(email),
                    new UserPassword(password),
                    new UserProfilePhotoLink(profilePhotoLink),
                    new UserRole(role)
            );
        }
    }
}
