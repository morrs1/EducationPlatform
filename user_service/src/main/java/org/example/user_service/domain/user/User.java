package org.example.user_service.domain.user;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.user_service.domain.base.BaseEntity;
import org.example.user_service.domain.user.vo.*;

import java.util.UUID;


@EqualsAndHashCode(callSuper = true)
@Data
public class User extends BaseEntity {

    private UUID id;
    private UserSurname surname;
    private UserName name;
    private UserPatronymic patronymic;
    private UserStatus userStatus;
    private UserEmail email;
    private UserPassword password;
    private UserProfilePhotoLink profilePhotoLink;
    private UserCurrentCourses currentCourses;
    private UserFinishedCourses finishedCourses;
    private UserCertificates certificates;

}
