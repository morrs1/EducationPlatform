package org.example.user_service.infrastructure.persistence.mappers;

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
                user.getRole().getRole()
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
                new UserRole(hibernateUser.getRole())
        );
    }
}
