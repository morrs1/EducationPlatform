package org.example.user_service.presentation.http.v1.mappers;

import org.example.user_service.application.interactors.user.create_user.CreateUserCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserPatronymicCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserNameCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserStatusCommand;
import org.example.user_service.application.interactors.user.update_user.ChangeUserSurnameCommand;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserPatronymicRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserNameRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserStatusRequest;
import org.example.user_service.presentation.http.v1.user.update_user.dto.ChangeUserSurnameRequest;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface UserMapperCommand {

    CreateUserCommand toCreateUserCommand(CreateUserRequest userRequest);

    @Mapping(target = "id", source = "id")
    ChangeUserNameCommand toChangeUserNameCommand(UUID id, ChangeUserNameRequest userRequest);

    @Mapping(target = "id", source = "id")
    ChangeUserSurnameCommand toChangeUserSurnameCommand(UUID id, ChangeUserSurnameRequest userRequest);

    @Mapping(target = "id", source = "id")
    ChangeUserPatronymicCommand toChangeUserPatronymicCommand(UUID id, ChangeUserPatronymicRequest userRequest);

    @Mapping(target = "id", source = "id")
    ChangeUserStatusCommand toChangeUserStatusCommand(UUID id, ChangeUserStatusRequest userRequest);

}
