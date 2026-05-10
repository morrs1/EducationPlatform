package org.example.user_service.support.fakes;

import org.example.user_service.domain.user.ports.PasswordHasher;

/**
 * Plain-text {@link PasswordHasher} used in unit tests where the cost of BCrypt
 * is unnecessary and the verification semantics are all the test cares about.
 *
 * <p>{@code hash(x)} returns {@code x}; {@code verify(raw, hashed)} returns
 * {@code raw.equals(hashed)}.
 */
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
