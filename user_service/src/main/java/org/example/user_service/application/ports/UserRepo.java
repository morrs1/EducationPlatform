package org.example.user_service.application.ports;

import org.example.user_service.application.interactors.create_user.CreateUserCommand;

import java.util.UUID;

public interface UserRepo {
    UUID createUser(CreateUserCommand userCommand);
}
