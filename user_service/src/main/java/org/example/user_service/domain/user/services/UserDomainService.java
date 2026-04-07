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
            UserSurname surname,
            UserName name,
            UserPatronymic patronymic,
            UserStatus userStatus,
            UserEmail email,
            UserPassword password,
            UserProfilePhotoLink profilePhotoLink,
            List<UserCurrentCourse> currentCourses,
            List<UserFinishedCourse> finishedCourses,
            List<UserCertificate> certificates
    ) {
        var user = new User(
                UUID.randomUUID(),
                surname,
                name,
                patronymic,
                userStatus,
                email,
                password,
                profilePhotoLink,
                currentCourses,
                finishedCourses,
                certificates
        );
        //TODO разобраться с getEmail().getEmail()
        this.events.add(new CreateUserDomainEvent(user.getId(), user.getEmail().getEmail()));
        return user;
    }

}
