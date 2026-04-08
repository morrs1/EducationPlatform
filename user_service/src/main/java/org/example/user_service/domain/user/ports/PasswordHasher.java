package org.example.user_service.domain.user.ports;

public interface PasswordHasher {

    String hash(String rawPassword);

    Boolean verify(String rawPassword, String hashedPassword);
}
