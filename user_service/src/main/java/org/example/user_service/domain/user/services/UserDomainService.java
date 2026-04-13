package org.example.user_service.domain.user.services;

import lombok.RequiredArgsConstructor;
import org.example.user_service.domain.base.BaseDomainService;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.ports.PasswordHasher;
import org.example.user_service.domain.user.vo.*;

import java.util.List;
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
            String profilePhotoLink,
            List<UUID> currentCourses,
            List<UUID> finishedCourses,
            List<UUID> certificates
    ) {
        var user = new User(
                UUID.randomUUID(),
                new UserSurname(surname),
                new UserName(name),
                new UserPatronymic(patronymic),
                new UserStatus(userStatus),
                new UserEmail(email),
                new UserPassword(passwordHasher.hash(password)),
                new UserProfilePhotoLink(profilePhotoLink),
                currentCourses.stream().map(UserCurrentCourse::new).toList(),
                finishedCourses.stream().map(UserFinishedCourse::new).toList(),
                certificates.stream().map(UserCertificate::new).toList()
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
}
