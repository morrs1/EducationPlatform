package org.example.api_gateway_authz_service.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.api_gateway_authz_service.auth.client.UserServiceAuthClient;
import org.example.api_gateway_authz_service.auth.dto.LoginRequest;
import org.example.api_gateway_authz_service.auth.dto.LoginResponse;
import org.example.api_gateway_authz_service.auth.dto.RegisterRequest;
import org.example.api_gateway_authz_service.auth.dto.RegisterResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Registration, login and JWT issuing through the API Gateway")
public class AuthController {

    private final UserServiceAuthClient userServiceAuthClient;
    private final JwtTokenService jwtTokenService;

    public AuthController(UserServiceAuthClient userServiceAuthClient, JwtTokenService jwtTokenService) {
        this.userServiceAuthClient = userServiceAuthClient;
        this.jwtTokenService = jwtTokenService;
    }

    @Operation(summary = "Register user", description = "Creates a user through user_service. This endpoint is public.")
    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        var response = userServiceAuthClient.register(request);
        return new RegisterResponse(response.id());
    }

    @Operation(summary = "Login user", description = "Authenticates through user_service and returns a gateway JWT.")
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        AuthenticatedUser user = userServiceAuthClient.login(request.email(), request.password());
        return new LoginResponse(
                jwtTokenService.createToken(user),
                "Bearer",
                jwtTokenService.expiresInSeconds(),
                user
        );
    }
}
