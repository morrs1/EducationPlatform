package org.example.user_service.application.ports;

import org.example.user_service.domain.user.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepo {
    UUID createUser(User user);

    Optional<User> readUserByEmail(String userEmail);
}
