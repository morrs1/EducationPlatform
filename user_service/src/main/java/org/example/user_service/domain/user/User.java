package org.example.user_service.domain.user;

import lombok.*;
import org.example.user_service.domain.base.BaseEntity;
import org.example.user_service.domain.user.vo.*;

import java.util.UUID;


@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@Getter
@Setter
@ToString(exclude = "password")
public class User extends BaseEntity {

    private UserSurname surname;
    private UserName name;
    private UserPatronymic patronymic;
    private UserStatus userStatus;
    private UserEmail email;
    private UserPassword password;
    private UserProfilePhotoLink profilePhotoLink;

    public User(
            UUID id,
            UserSurname surname,
            UserName name,
            UserPatronymic patronymic,
            UserStatus userStatus,
            UserEmail email,
            UserPassword password,
            UserProfilePhotoLink profilePhotoLink
    ) {
        super(id);
        this.surname = surname;
        this.name = name;
        this.patronymic = patronymic;
        this.userStatus = userStatus;
        this.email = email;
        this.password = password;
        this.profilePhotoLink = profilePhotoLink;
    }
}
