package org.example.user_service.infrastructure.adapters.persistence;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.infrastructure.mappers.UserMapperHibernate;
import org.springframework.stereotype.Repository;

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
}
