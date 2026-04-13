package org.example.user_service.presentation.http.v1.user.update_user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.update_user.ChangePersonalDataUserInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserNameRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserPatronymicRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserStatusRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserSurnameRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Operations for user management")
public class UpdateUserHandler {

    private final ChangePersonalDataUserInteractor interactor;
    private final UserMapperCommand mapper;

    @PatchMapping("/{id}/change_name")
    @Operation(summary = "Change user name")
    public ResponseEntity<String> updateName(@PathVariable UUID id,
                                             @RequestBody ChangeUserNameRequest changeUserNameRequest) {
        interactor.updateName(mapper.toChangeUserNameCommand(id, changeUserNameRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/{id}/change_surname")
    @Operation(summary = "Change user surname")
    public ResponseEntity<String> updateSurname(@PathVariable UUID id,
                                                @RequestBody ChangeUserSurnameRequest changeUserSurnameRequest) {
        interactor.updateSurname(mapper.toChangeUserSurnameCommand(id, changeUserSurnameRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/{id}/change_patronymic")
    @Operation(summary = "Change user patronymic")
    public ResponseEntity<String> updatePatronymic(@PathVariable UUID id,
                                                   @RequestBody ChangeUserPatronymicRequest changeUserPatronymicRequest) {
        interactor.updatePatronymic(mapper.toChangeUserPatronymicCommand(id, changeUserPatronymicRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }

    @PatchMapping("/{id}/change_status")
    @Operation(summary = "Change user status")
    public ResponseEntity<String> updateStatus(@PathVariable UUID id,
                                               @RequestBody ChangeUserStatusRequest changeUserStatusRequest) {
        interactor.updateStatus(mapper.toChangeUserStatusCommand(id, changeUserStatusRequest));
        return ResponseEntity.status(200).body("Update was successful");
    }
}
