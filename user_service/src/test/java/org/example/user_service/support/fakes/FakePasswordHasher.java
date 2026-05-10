package org.example.user_service.support.fakes;

import org.example.user_service.domain.user.ports.PasswordHasher;

public final class FakePasswordHasher implements PasswordHasher {

    @Override
    public String hash(String rawPassword) {
        return rawPassword;
    }

    @Override
    public Boolean verify(String rawPassword, String hashedPassword) {
        return rawPassword.equals(hashedPassword);
    }
}
