package org.example.user_service.domain.user;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseEntity;
import org.example.user_service.domain.user.vo.*;

import java.util.List;


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
    private List<UserCurrentCourse> currentCourses;
    private List<UserFinishedCourse> finishedCourses;
    private List<UserCertificate> certificates;

}
