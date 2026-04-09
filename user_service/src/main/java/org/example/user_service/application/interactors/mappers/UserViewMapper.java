package org.example.user_service.application.interactors.mappers;

import org.example.user_service.application.interactors.read_user_by_id.ReadUserByIdView;
import org.example.user_service.domain.user.User;
import org.example.user_service.domain.user.vo.UserCertificate;
import org.example.user_service.domain.user.vo.UserCurrentCourse;
import org.example.user_service.domain.user.vo.UserFinishedCourse;

public class UserViewMapper {

    public ReadUserByIdView toReadUserByIdView(User user) {
        return new ReadUserByIdView(user.getSurname().getSurname(),
                user.getName().getName(),
                user.getPatronymic().getPatronymic(),
                user.getUserStatus().getStatus(),
                user.getEmail().getEmail(),
                user.getProfilePhotoLink().getProfilePhotoLink(),
                user.getCurrentCourses().stream().map(UserCurrentCourse::getCurrentCourse).toList(),
                user.getFinishedCourses().stream().map(UserFinishedCourse::getFinishedCourse).toList(),
                user.getCertificates().stream().map(UserCertificate::getCertificate).toList()
        );
    }
}
