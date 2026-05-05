package org.example.user_service.application.interactors.mappers;

import org.example.user_service.application.interactors.user.read_user_by_id.ReadUserByIdView;
import org.example.user_service.domain.user.User;

public class UserViewMapper {

    public ReadUserByIdView toReadUserByIdView(User user) {
        return new ReadUserByIdView(
                user.getSurname().getSurname(),
                user.getName().getName(),
                user.getPatronymic().getPatronymic(),
                user.getUserStatus().getStatus(),
                user.getEmail().getEmail(),
                user.getProfilePhotoLink().getProfilePhotoLink(),
                user.getRole().getRole());
    }
}
