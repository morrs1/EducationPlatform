package org.example.user_service.infrastructure.adapters.persistence;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.create_user.CreateUserCommand;
import org.example.user_service.application.ports.UserRepo;
import org.springframework.stereotype.Service;

import java.util.UUID;
@Service
@RequiredArgsConstructor
public class HibernateUserRepo implements UserRepo {

    private final EntityManager entityManager;


    @Override
    public UUID createUser(CreateUserCommand userCommand) {


        return null;
    }
}
