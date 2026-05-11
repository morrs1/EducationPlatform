package org.example.user_service.support.factories;

import org.example.user_service.application.interactors.user.create_user.CreateUserCommand;

public final class CreateUserCommandFactory {

    private CreateUserCommandFactory() {
    }

    public static CreateUserCommand aCommand() {
        return new Builder().build();
    }

    public static CreateUserCommand aCommandWithEmail(String email) {
        return new Builder().email(email).build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private String surname = UserFactory.DEFAULT_SURNAME;
        private String name = UserFactory.DEFAULT_NAME;
        private String patronymic = UserFactory.DEFAULT_PATRONYMIC;
        private String userStatus = UserFactory.DEFAULT_STATUS;
        private String userEmail = UserFactory.DEFAULT_EMAIL;
        private String userPassword = UserFactory.DEFAULT_PASSWORD;
        private String userProfilePhotoLink = UserFactory.DEFAULT_PHOTO_LINK;

        private Builder() {
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

        public Builder userStatus(String userStatus) {
            this.userStatus = userStatus;
            return this;
        }

        public Builder email(String userEmail) {
            this.userEmail = userEmail;
            return this;
        }

        public Builder password(String userPassword) {
            this.userPassword = userPassword;
            return this;
        }

        public Builder profilePhotoLink(String userProfilePhotoLink) {
            this.userProfilePhotoLink = userProfilePhotoLink;
            return this;
        }

        public CreateUserCommand build() {
            return new CreateUserCommand(
                    surname,
                    name,
                    patronymic,
                    userStatus,
                    userEmail,
                    userPassword,
                    userProfilePhotoLink
            );
        }
    }
}
