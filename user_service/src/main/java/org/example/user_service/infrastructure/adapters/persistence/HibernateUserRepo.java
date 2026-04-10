package org.example.user_service.infrastructure.adapters.persistence;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.infrastructure.persistence.mappers.UserMapperHibernate;
import org.example.user_service.infrastructure.persistence.models.HibernateUser;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateUserRepo implements UserRepo {

    private final EntityManager entityManager;
    private final UserMapperHibernate mapper;

    @Override
    public UUID createUser(User user) {
        var hibernateUser = mapper.toHibernateUser(user);
        entityManager.merge(hibernateUser);
        return hibernateUser.getId();
    }

    @Override
    public Optional<User> readUserByEmail(String userEmail) {
        return entityManager.createQuery(
                        "select u from HibernateUser u where u.email = :email",
                        HibernateUser.class
                )
                .setParameter("email", userEmail)
                .getResultStream()
                .findFirst()
                .map(mapper::toDomainUser);
    }

    @Override
    public Optional<User> readUserById(UUID id) {
        return entityManager.createQuery(
                "select u from HibernateUser u where u.id = :id",
                HibernateUser.class
                )
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .map(mapper::toDomainUser);
    }

    @Override
    public void update(User user) {
        var existingUser = entityManager.find(HibernateUser.class, user.getId());
        if (existingUser == null) {
            throw new UserNotFoundException(String.format("User with id %s was not found", user.getId()));
        }

        entityManager.merge(mapper.toHibernateUser(user));
    }


}
