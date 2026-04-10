package org.example.user_service.presentation.http.v1.mappers;

import org.example.user_service.application.interactors.user.create_user.CreateUserCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserPatronymicCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserNameCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserProfilePhotoLinkCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserStatusCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserSurnameCommand;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserPatronymicRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserNameRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserProfilePhotoLinkRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserStatusRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserSurnameRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapperCommand {

    CreateUserCommand toCreateUserCommand(CreateUserRequest userRequest);

    ChangeUserNameCommand toChangeUserNameCommand(ChangeUserNameRequest userRequest);

    ChangeUserSurnameCommand toChangeUserSurnameCommand(ChangeUserSurnameRequest userRequest);

    ChangeUserPatronymicCommand toChangeUserPatronymicCommand(ChangeUserPatronymicRequest userRequest);

    ChangeUserStatusCommand toChangeUserStatusCommand(ChangeUserStatusRequest userRequest);

    ChangeUserProfilePhotoLinkCommand toChangeUserProfilePhotoLinkCommand(ChangeUserProfilePhotoLinkRequest userRequest);

}
