package org.example.user_service.domain.user;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseEntity;
import org.example.user_service.domain.user.vo.*;


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
    private UserCurrentCourses currentCourses;
    private UserFinishedCourses finishedCourses;
    private UserCertificates certificates;

}
