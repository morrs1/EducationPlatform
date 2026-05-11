package org.example.user_service.domain.user.services;

import lombok.RequiredArgsConstructor;
import org.example.user_service.domain.base.BaseDomainService;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.vo.*;

import java.util.UUID;

@RequiredArgsConstructor
public class UserDomainService extends BaseDomainService {

    private final PasswordHasher passwordHasher;

    public User add(
            String surname,
            String name,
            String patronymic,
            String userStatus,
            String email,
            String password,
            String profilePhotoLink
    ) {
        var user =
                new User(
                        UUID.randomUUID(),
                        new UserSurname(surname),
                        new UserName(name),
                        new UserPatronymic(patronymic),
                        new UserStatus(userStatus),
                        new UserEmail(email),
                        new UserPassword(passwordHasher.hash(password)),
                        new UserProfilePhotoLink(profilePhotoLink),
                        new UserRole(UserRole.DEFAULT)
                );
        this.recordEvent(new CreateUserDomainEvent(user.getId(), user.getEmail().getEmail()));
        return user;
    }

    public void updateName(User user, String newName) {
        user.setName(new UserName(newName));
    }

    public void updateSurname(User user, String newSurname) {
        user.setSurname(new UserSurname(newSurname));
    }

    public void updatePatronymic(User user, String newPatronymic) {
        user.setPatronymic(new UserPatronymic(newPatronymic));
    }

    public void updateStatus(User user, String newStatus) {
        user.setUserStatus(new UserStatus(newStatus));
    }

    public void updateProfilePhotoLink(User user, String newProfilePhotoLink) {
        user.setProfilePhotoLink(new UserProfilePhotoLink(newProfilePhotoLink));
    }

    public void assignAuthorRole(User user) {
        user.setRole(new UserRole(UserRole.AUTHOR));
    }

    public void assignAdminRole(User user) {
        user.setRole(new UserRole(UserRole.ADMIN));
    }

    public void updatePassword(User user, String rawNewPassword) {
        user.setPassword(new UserPassword(passwordHasher.hash(rawNewPassword)));
    }

    public void updateEmail(User user, String newEmail) {
        user.setEmail(new UserEmail(newEmail));
    }
}
