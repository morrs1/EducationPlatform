package org.example.user_service.presentation.http.v1.user.create.handlers;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.create_user.CreateUserCommand;
import org.example.user_service.application.interactors.create_user.CreateUserInteractor;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class CreateHandler {

    private final CreateUserInteractor createUserInteractor;

    @PostMapping()
    public CreateUserResponse create(@RequestBody CreateUserRequest userRequest) {
        return new CreateUserResponse(createUserInteractor.create(toCommand(userRequest)));
    }

    private CreateUserCommand toCommand(CreateUserRequest userRequest) {
        return new CreateUserCommand(
                userRequest.surname(),
                userRequest.name(),
                userRequest.patronymic(),
                userRequest.userStatus(),
                userRequest.userEmail(),
                userRequest.userPassword(),
                userRequest.userProfilePhotoLink(),
                userRequest.currentCourses(),
                userRequest.finishedCourses(),
                userRequest.certificates()
        );
    }
}
