package org.example.user_service.support.fakes;

import org.example.user_service.domain.user.ports.PasswordHasher;

/**
 * Plain-text {@link PasswordHasher} that records how many times each method
 * was called. Use it to assert that a use case did not perform expensive work
 * (e.g. did not hash a password on a duplicate-email path).
 */
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
