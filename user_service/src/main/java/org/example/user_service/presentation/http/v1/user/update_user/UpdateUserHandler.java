package org.example.user_service.presentation.http.v1.user.update_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.update_user.ChangePersonalDataUserInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserPatronymicRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserNameRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserProfilePhotoLinkRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserStatusRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserSurnameRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
public class UpdateUserHandler {

    private final ChangePersonalDataUserInteractor interactor;
    private final UserMapperCommand mapper;

    @PatchMapping("/change_name")
    public ResponseEntity<String> changeUserName(@RequestBody ChangeUserNameRequest changeUserNameRequest) {
        interactor.changeUserName(mapper.toChangeUserNameCommand(changeUserNameRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/change_surname")
    public ResponseEntity<String> changeUserSurname(@RequestBody ChangeUserSurnameRequest changeUserSurnameRequest) {
        interactor.changeUserSurname(mapper.toChangeUserSurnameCommand(changeUserSurnameRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/change_patronymic")
    public ResponseEntity<String> changeUserPatronymic(@RequestBody ChangeUserPatronymicRequest changeUserPatronymicRequest) {
        interactor.changeUserPatronymic(mapper.toChangeUserPatronymicCommand(changeUserPatronymicRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/change_status")
    public ResponseEntity<String> changeUserStatus(@RequestBody ChangeUserStatusRequest changeUserStatusRequest) {
        interactor.changeUserStatus(mapper.toChangeUserStatusCommand(changeUserStatusRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/change_profile_photo_link")
    public ResponseEntity<String> changeUserProfilePhotoLink(@RequestBody ChangeUserProfilePhotoLinkRequest changeUserProfilePhotoLinkRequest) {
        interactor.changeUserProfilePhotoLink(mapper.toChangeUserProfilePhotoLinkCommand(changeUserProfilePhotoLinkRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

}
