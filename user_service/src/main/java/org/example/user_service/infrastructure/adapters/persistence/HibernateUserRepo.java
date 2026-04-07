package org.example.user_service.infrastructure.adapters.persistence;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.vo.UserCertificate;
import org.example.user_service.domain.user.vo.UserCurrentCourse;
import org.example.user_service.domain.user.vo.UserFinishedCourse;
import org.example.user_service.infrastructure.persistence.models.HibernateUser;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class HibernateUserRepo implements UserRepo {

    private final EntityManager entityManager;


    @Override
    public UUID createUser(User user) {
        var hibernateUser = new HibernateUser(
                UUID.randomUUID(),
                user.getSurname().getSurname(),
                user.getName().getName(),
                user.getPatronymic().getPatronymic(),
                user.getUserStatus().getStatus(),
                user.getEmail().getEmail(),
                user.getPassword().getPassword(),
                user.getProfilePhotoLink().getProfilePhotoLink(),
                user.getCurrentCourses().stream().map(UserCurrentCourse::getCurrentCourse).toList(),
                user.getFinishedCourses().stream().map(UserFinishedCourse::getFinishedCourse).toList(),
                user.getCertificates().stream().map(UserCertificate::getCertificate).toList()
        );
        entityManager.merge(hibernateUser);
        return hibernateUser.getId();
    }
}
