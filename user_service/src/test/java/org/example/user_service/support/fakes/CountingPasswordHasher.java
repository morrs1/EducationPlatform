package org.example.user_service.support.fakes;

import org.example.user_service.domain.user.ports.PasswordHasher;

public final class CountingPasswordHasher implements PasswordHasher {

    private int hashCalls;
    private int verifyCalls;

    @Override
    public String hash(String rawPassword) {
        hashCalls++;
        return rawPassword;
    }

    @Override
    public Boolean verify(String rawPassword, String hashedPassword) {
        verifyCalls++;
        return rawPassword.equals(hashedPassword);
    }

    public int hashCalls() {
        return hashCalls;
    }

    public int verifyCalls() {
        return verifyCalls;
    }
}
