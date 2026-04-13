package org.example.user_service.presentation.http.v1.user.create.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.create_user.CreateUserInteractor;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserResponse;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Operations for user management")
public class CreateHandler {

    private final CreateUserInteractor createUserInteractor;
    private final UserMapperCommand mapper;

    @PostMapping()
    @Operation(summary = "Create user", description = "Creates a new user and returns its identifier.")
    public CreateUserResponse add(@RequestBody CreateUserRequest userRequest) {
        return new CreateUserResponse(createUserInteractor.add(mapper.toCreateUserCommand(userRequest)));
    }

}
