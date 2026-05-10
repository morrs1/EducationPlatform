package org.example.user_service.support.fakes;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;

public final class FakeUserRepo implements UserRepo {

    private final Map<UUID, User> usersById = new HashMap<>();
    private int addCalls;
    private int updateCalls;
    private User lastAdded;
    private User lastUpdated;

    public static FakeUserRepo empty() {
        return new FakeUserRepo();
    }

    public static FakeUserRepo withUser(User user) {
        FakeUserRepo repo = new FakeUserRepo();
        repo.usersById.put(user.getId(), user);
        return repo;
    }

    @Override
    public UUID add(User user) {
        addCalls++;
        lastAdded = user;
        usersById.put(user.getId(), user);
        return user.getId();
    }

    @Override
    public Optional<User> readByEmail(String userEmail) {
        return usersById.values().stream()
                .filter(u -> u.getEmail().getEmail().equals(userEmail))
                .findFirst();
    }

    @Override
    public Optional<User> readById(UUID id) {
        return Optional.ofNullable(usersById.get(id));
    }

    @Override
    public void update(User user) {
        updateCalls++;
        lastUpdated = user;
        usersById.put(user.getId(), user);
    }

    public int addCalls() {
        return addCalls;
    }

    public int updateCalls() {
        return updateCalls;
    }

    public User lastAdded() {
        return lastAdded;
    }

    public User lastUpdated() {
        return lastUpdated;
    }

    public int size() {
        return usersById.size();
    }
}
