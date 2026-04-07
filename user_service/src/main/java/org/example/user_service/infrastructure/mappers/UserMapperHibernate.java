package org.example.user_service.infrastructure.mappers;

import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.vo.*;
import org.example.user_service.infrastructure.persistence.models.HibernateUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapperHibernate {

    default HibernateUser toHibernateUser(User user) {
        return new HibernateUser(
                user.getId(),
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
    }

    default User toDomainUser(HibernateUser hibernateUser) {
        return new User(
                hibernateUser.getId(),
                new UserSurname(hibernateUser.getSurname()),
                new UserName(hibernateUser.getName()),
                new UserPatronymic(hibernateUser.getPatronymic()),
                new UserStatus(hibernateUser.getUserStatus()),
                new UserEmail(hibernateUser.getEmail()),
                new UserPassword(hibernateUser.getPassword()),
                new UserProfilePhotoLink(hibernateUser.getProfilePhotoLink()),
                hibernateUser.getCurrentCourses().stream().map(UserCurrentCourse::new).toList(),
                hibernateUser.getFinishedCourses().stream().map(UserFinishedCourse::new).toList(),
                hibernateUser.getCertificates().stream().map(UserCertificate::new).toList()
        );
    }
}
