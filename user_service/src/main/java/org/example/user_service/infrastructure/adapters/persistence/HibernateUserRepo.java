package org.example.user_service.infrastructure.adapters.persistence;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.create_user.CreateUserCommand;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.infrastructure.persistence.models.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HibernateUserRepo implements UserRepo {

    private final EntityManager entityManager;


    @Override
    public UUID createUser(CreateUserCommand userCommand) {
        var newUser = new User(
                UUID.randomUUID(),
                userCommand.surname(),
                userCommand.name(),
                userCommand.patronymic(),
                userCommand.userStatus(),
                userCommand.userEmail(),
                userCommand.userPassword(),
                userCommand.userProfilePhotoLink(),
                userCommand.currentCourses(),
                userCommand.finishedCourses(),
                userCommand.certificates()
        );
        entityManager.merge(newUser);
        return newUser.getId();
    }
}
