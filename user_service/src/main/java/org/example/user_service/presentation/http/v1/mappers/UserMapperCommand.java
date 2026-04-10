package org.example.user_service.presentation.http.v1.mappers;

import org.example.user_service.application.interactors.user.create_user.CreateUserCommand;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapperCommand {

    CreateUserCommand toCreateUserCommand(CreateUserRequest userRequest);


}
