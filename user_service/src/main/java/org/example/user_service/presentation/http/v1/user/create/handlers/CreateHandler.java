package org.example.user_service.presentation.http.v1.user.create.handlers;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.create_user.CreateUserInteractor;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserResponse;
import org.example.user_service.presentation.http.v1.user.mappers.UserMapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class CreateHandler {

    private final CreateUserInteractor createUserInteractor;
    private final UserMapper mapper;

    @PostMapping()
    public CreateUserResponse create(@RequestBody CreateUserRequest userRequest) {
        return new CreateUserResponse(createUserInteractor.create(mapper.toCreateUserCommand(userRequest)));
    }

}
