package org.example.user_service.domain.user.services;

import org.example.user_service.domain.base.BaseDomainService;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.events.CreateUserDomainEvent;
import org.example.user_service.domain.user.vo.*;

import java.util.List;
import java.util.UUID;

public class UserDomainService extends BaseDomainService {

//TODO    private final PasswordHasher hasher;

    public User createUser(
            String surname,
            String name,
            String patronymic,
            String userStatus,
            String email,
            String password,
            String profilePhotoLink,
            List<String> currentCourses,
            List<String> finishedCourses,
            List<String> certificates
    ) {
        var user = new User(
                UUID.randomUUID(),
                new UserSurname(surname),
                new UserName(name),
                new UserPatronymic(patronymic),
                new UserStatus(userStatus),
                new UserEmail(email),
                new UserPassword(password),
                new UserProfilePhotoLink(profilePhotoLink),
                currentCourses.stream().map(UserCurrentCourse::new).toList(),
                finishedCourses.stream().map(UserFinishedCourse::new).toList(),
                certificates.stream().map(UserCertificate::new).toList()
        );
        //TODO разобраться с getEmail().getEmail()
        this.events.add(new CreateUserDomainEvent(user.getId(), user.getEmail().getEmail()));
        return user;
    }

}
