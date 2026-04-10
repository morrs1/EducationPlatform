package org.example.user_service.presentation.http.v1.user.update_user;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.update_user.ChangePersonalDataUserInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserNameRequest;
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


}
