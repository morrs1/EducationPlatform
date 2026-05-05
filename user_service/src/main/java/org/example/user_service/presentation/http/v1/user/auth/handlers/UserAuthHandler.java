package org.example.user_service.presentation.http.v1.user.auth.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.authenticate_user.AuthenticateUserCommand;
import org.example.user_service.application.interactors.user.authenticate_user.AuthenticateUserInteractor;
import org.example.user_service.application.interactors.user.create_user.CreateUserInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperCommand;
import org.example.user_service.presentation.http.v1.user.auth.dto.AuthenticateUserRequest;
import org.example.user_service.presentation.http.v1.user.auth.dto.AuthenticatedUserResponse;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserRequest;
import org.example.user_service.presentation.http.v1.user.create.dto.CreateUserResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user/auth")
@RequiredArgsConstructor
@Tag(name = "User auth", description = "Internal user-service auth operations without JWT issuing")
public class UserAuthHandler {

    private final CreateUserInteractor createUserInteractor;
    private final AuthenticateUserInteractor authenticateUserInteractor;
    private final UserMapperCommand mapper;

    @PostMapping("/register")
    @Operation(summary = "Register user in user database")
    public CreateUserResponse register(@RequestBody CreateUserRequest request) {
        return new CreateUserResponse(createUserInteractor.add(mapper.toCreateUserCommand(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Verify user credentials")
    public AuthenticatedUserResponse login(@RequestBody AuthenticateUserRequest request) {
        var view = authenticateUserInteractor.authenticate(
                new AuthenticateUserCommand(request.email(), request.password())
        );
        return new AuthenticatedUserResponse(
                view.id(),
                view.email(),
                view.role(),
                view.userStatus()
        );
    }
}
